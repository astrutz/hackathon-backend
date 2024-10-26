import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { Game } from '../entities/game.entity';
import { ScoreHistory } from '../entities/score-history.interface';
import axios, { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { HttpException, HttpStatus } from '@nestjs/common';

export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Player)
    private readonly gameRepository: Repository<Game>,
    private readonly httpService: HttpService,
  ) {
  }

  async findAll(sortBy?: string): Promise<any[]> {
    try {
      const players = await this.playerRepository.find({
        relations: ['gamesInTeam1', 'gamesInTeam2', 'gamesInTeam1.team1Players', 'gamesInTeam1.team2Players', 'gamesInTeam2.team1Players', 'gamesInTeam2.team2Players'],
      });

      // Sortieren basierend auf dem sortBy-Parameter, Standard: Billo-Score
      const sortedPlayers = players.sort((a, b) => {
        if (sortBy === 'elo') {
          return b.scores.elo - a.scores.elo;
        }
        return b.scores.billo - a.scores.billo; // Standard: nach Billo-Score
      });

      return sortedPlayers.map(player => ({
        id: player.id,
        name: player.name,
        won: player.won,
        lost: player.lost,
        scores: player.scores,
        games: player.games.map(game => ({
          id: game.id,
          timestamp: game.timestamp,
          scoreTeam1: game.scoreTeam1,
          scoreTeam2: game.scoreTeam2,
          team1Players: game.team1Players.map(p => p.id), // Only include IDs
          team2Players: game.team2Players.map(p => p.id), // Only include IDs
        })),
      }));
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error; // Or handle it appropriately
    }
  }

  async createPlayer(name: string, hash: string): Promise<Player> {
    const playerData: Partial<Player> = new Player();
    playerData.name = name;
    playerData.password = hash;
    playerData.scoreHistory = [this.getCurrentHistoryEntry(playerData)];

    const player = this.playerRepository.create(playerData);
    return this.playerRepository.save(player);
  }

  getCurrentHistoryEntry(player: Partial<Player>): ScoreHistory {
    const now: Date = new Date();
    return {
      year: now.getFullYear(),
      week: this.getWeekNumber(now),
      elo: player.scores.elo,
      billo: player.scores.billo,
    };
  }


  async findById(id: number): Promise<Player> {
    return this.playerRepository.findOneBy({ id: id });
  }

  async deleteById(id: number): Promise<void> {
    await this.playerRepository.delete({ id: id });
  }

  async getPlayerScoreHistory(playerId: number): Promise<any> {
    return (await this.playerRepository.findOneBy({ id: playerId })).scoreHistory;
  }


  async existPlayerByName(name: string): Promise<Boolean> {
    return await this.playerRepository.existsBy({ name: name });
  }

  async findByName(name: string): Promise<Player> {
    return this.playerRepository.findOneBy({ name: name });
  }

  private getWeekNumber(date: Date): number {
    const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNum = (tempDate.getDay() + 6) % 7; // Adjust so that Monday is day 0 and Sunday is day 6

    // Set tempDate to the nearest Thursday to determine the first week of the year
    tempDate.setDate(tempDate.getDate() - dayNum + 3);

    // Calculate the first Thursday of the year
    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    const firstWeekStart = firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3;

    const startOfYear = new Date(tempDate.getFullYear(), 0, firstWeekStart);

    // Calculate week number
    return Math.ceil(((tempDate.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
  }

  async updateImage(id: number, image: Express.Multer.File): Promise<void> {
    const formData = new FormData();
    formData.append('key', process.env.THUMBSNAP_API_KEY); // API key
    formData.append('media', image.buffer as any, image.originalname);

    // Make the POST request
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post("https://thumbsnap.com/api/upload", formData, {
        headers: {
          ...formData.getHeaders(),
        },
      }),
    );

    if (response.data && response.data.success) {
      const player = await this.playerRepository.findOneBy({ id: id });
      player.imageUrl = response.data.data.thumb;
      this.playerRepository.save(player);
    } else {
      throw new HttpException(
        'Image upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateName(id: number, name: string): Promise<void> {
    const player = await this.playerRepository.findOneBy({ id: id });
    player.name = name;
    this.playerRepository.save(player);
  }
}

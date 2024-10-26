import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { Game } from '../entities/game.entity';
import { ScoreHistoryDto } from '../entities/score-history.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,

    @InjectRepository(Player)
    private gameRepository: Repository<Game>,
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
    const playerData: Partial<Player> = new Player()
    playerData.name = name;
    playerData.password = hash;

    const player = this.playerRepository.create(playerData);
    return this.playerRepository.save(player);
  }

  async findById(id: number): Promise<Player> {
    return this.playerRepository.findOneBy({ id: id });
  }

  async deleteById(id: number): Promise<void> {
    await this.playerRepository.delete({ id: id });
  }

  async getPlayerScoreHistoryByWeek(playerId: number): Promise<any> {
    // Fetch the player
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: ['gamesInTeam1', 'gamesInTeam2', 'gamesInTeam1.team1Players', 'gamesInTeam1.team2Players', 'gamesInTeam2.team1Players', 'gamesInTeam2.team2Players'],
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Initialize a map to hold weekly scores
    const weeklyScores: { [key: string]: number } = {};

    // Combine games from both teams the player played in
    const allGames = [...player.gamesInTeam1, ...player.gamesInTeam2];

    // Calculate scores per week
    allGames.forEach(game => {
      const week = this.getISOWeek(game.timestamp);
      const year = this.getYear(game.timestamp);
      const weekKey = `${year}-W${week}`; // e.g., '2024-W42'

      // Initialize the score for the week if it doesn't exist
      if (!weeklyScores[weekKey]) {
        weeklyScores[weekKey] = 0;
      }

      // Calculate score from the game
      if (game.scoreTeam1 > game.scoreTeam2 && game.team1Players.includes(player)) {
        weeklyScores[weekKey] += 1; // Win
      } else if (game.scoreTeam2 > game.scoreTeam1 && game.team2Players.includes(player)) {
        weeklyScores[weekKey] += 1; // Win
      } else if (game.scoreTeam1 === game.scoreTeam2) {
        weeklyScores[weekKey] += 0.5; // Tie
      }
    });

    // Convert the map to an array of scores for easier consumption
    return Object.entries(weeklyScores).map(([week, score]) => ({ week, score }));
  }

  private getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getUTCDay() + 6) % 7; // Make Sunday = 6, Monday = 0
    target.setUTCDate(target.getUTCDate() - dayNr + 3); // Set to nearest Thursday
    const jan4 = new Date(target.getUTCFullYear(), 0, 4);
    const dayOfYear = (target.getTime() - jan4.getTime()) / (24 * 60 * 60 * 1000);
    return 1 + Math.floor(dayOfYear / 7);
  }

  private getYear(date: Date): number {
    return date.getUTCFullYear();
  }


  async existPlayerByName(name: string): Promise<Boolean> {
    return await this.playerRepository.existsBy({ name: name });
  }

  async findByName(name: string): Promise<Player> {
    return this.playerRepository.findOneBy({ name: name });
  }

}

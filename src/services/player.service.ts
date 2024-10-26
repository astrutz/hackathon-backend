import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async findAll(): Promise<any[]> {
    try {
      const players = await this.playerRepository.find({
        relations: ['gamesInTeam1', 'gamesInTeam2', 'gamesInTeam1.team1Players', 'gamesInTeam1.team2Players', 'gamesInTeam2.team1Players', 'gamesInTeam2.team2Players'],
      });

      return players.map(player => ({
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

  async createPlayer(playerData: Partial<Player>): Promise<Player> {
        const player = this.playerRepository.create(playerData);
    return this.playerRepository.save(player);
  }

  async findById(id: number): Promise<Player> {
    return this.playerRepository.findOneBy({ id: id });
  }

  async deleteById(id: number): Promise<void> {
    await this.playerRepository.delete({ id: id });
  }
}

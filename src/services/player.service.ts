import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
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

  async existPlayerByName(name: string): Promise<Boolean> {
    return await this.playerRepository.existsBy({ name: name });
  }

  async findByName(name: string): Promise<Player> {
    return this.playerRepository.findOneBy({ name: name });
  }

}

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

  async createPlayer(playerData: Partial<Player>): Promise<Player> {
    // Validierung 1: Überprüfen, ob Name befüllt ist
    if (!playerData.name || playerData.name.trim() === '') {
      throw new BadRequestException('Player name is required');
    }

    // Validierung 2: Überprüfen, ob der Name bereits in der Datenbank existiert
    const existingPlayer = await this.playerRepository.findOne({
      where: { name: playerData.name.trim() }, // Trimme den Namen zur Sicherstellung
    });
    if (existingPlayer) {
      throw new BadRequestException('Player with this name already exists');
    }

    playerData.scores = { elo: 1000, glicko: 1500, billo: 0 };
    playerData.won = 0;
    playerData.lost = 0;

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

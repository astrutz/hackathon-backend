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
    const players = await this.playerRepository.find({
      relations: ['gamesInTeam1', 'gamesInTeam2'],
    });

    return players.map(player => ({
      id: player.id,
      name: player.name,
      won: player.won,
      lost: player.lost,
      scores: player.scores,
      games: player.games,  // Include the computed games property
    }));
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

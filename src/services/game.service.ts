import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { In, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,

    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const team1Players = await this.playerRepository.findBy({ id: In(gameData.team1Players) });
    const team2Players = await this.playerRepository.findBy({ id: In(gameData.team2Players) });

    const game = this.gameRepository.create({
      ...gameData,
      team1Players,
      team2Players,
    });
    return this.gameRepository.save(game);
  }

  async findById(id: number): Promise<Game> {
    return this.gameRepository.findOneBy({ id: id });
  }

  async deleteById(id: number): Promise<void> {
    await this.gameRepository.delete({ id: id });
  }
}

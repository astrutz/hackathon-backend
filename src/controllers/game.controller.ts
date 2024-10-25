import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Game } from '../entities/game.entity';
import { GameService } from '../services/game.service';

@Controller("/games")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Post()
  async addGame(@Body() gameData: Game): Promise<Game> {
    return this.gameService.createGame(gameData);
  }

  @Get(":id")
  async getPlayerById(@Param("id") id: number): Promise<Game> {
    return this.gameService.findById(id);
  }

  @Delete(":id")
  async deletePlayerById(@Param("id") id: number): Promise<void> {
    await this.gameService.deleteById(id);
  }

  @Get("/test")
  getHello(): string {
    return "huhu1212";
  }

}

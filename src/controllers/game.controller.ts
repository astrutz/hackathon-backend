import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Game } from '../entities/game.entity';
import { GameService } from '../services/game.service';
import { GameResponse } from '../entities/game.response.interface';

@Controller("/games")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getAll(): Promise<GameResponse[]> {
    return this.gameService.findAll();
  }

  @Get()
  async getByWeek(@Query('week') week: number, @Query("year") year: number): Promise<Game[]>{
    return this.gameService.findByWeek(week, year);
  }

  @Post()
  async addGame(@Body() gameData: Game): Promise<Game> {
    return this.gameService.createGame(gameData);
  }

  @Get("/:id")
  async getPlayerById(@Param("id") id: number): Promise<Game> {
    return this.gameService.findById(id);
  }

  @Delete("/:id")
  async deletePlayerById(@Param("id") id: number): Promise<void> {
    await this.gameService.deleteById(id);
  }

}

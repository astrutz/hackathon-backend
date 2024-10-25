import { Controller, Get } from '@nestjs/common';
import { GameService } from './services/game.service';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getHello(): string {
    this.gameService.createGame({scoreTeam1: 1, scoreTeam2: 20});
    return "huhu";
  }
}

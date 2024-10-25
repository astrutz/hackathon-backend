import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getHello(): string {
    this.gameService.createGame({name: "test"});
    return "huhu";
  }
}

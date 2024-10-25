import { Body, Controller, Get, Post } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';

@Controller("/players")
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Post()
    async addPlayer(@Body() playerData: Player): Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }

    @Get()
    getHello(): string {
        return "huhu1212";
    }

}

import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';
import { Game } from '../entities/game.entity';

@Controller("/players")
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    async getAll(@Query('sort') sort?: string): Promise<any[]> {
        return this.playerService.findAll(sort);
    }

    @Post()
    async addPlayer(@Body() playerData: Player): Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }

    @Get("/id-:id")
    async getPlayerById(@Param("id") id: number): Promise<Player> {
        return this.playerService.findById(id);
    }

    @Delete("/id-:id")
    async deletePlayerById(@Param("id") id: number): Promise<void> {
        await this.playerService.deleteById(id);
    }

}

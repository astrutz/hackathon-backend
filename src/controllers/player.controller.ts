import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';
import { Game } from '../entities/game.entity';

@Controller("/players")
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    async getAll(): Promise<Player[]> {
        return this.playerService.findAll();
    }

    @Post()
    async addPlayer(@Body() playerData: Player): Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }

    @Get(":id")
    async getPlayerById(@Param("id") id: number): Promise<Player> {
        return this.playerService.findById(id);
    }

    @Delete(":id")
    async deletePlayerById(@Param("id") id: number): Promise<void> {
        await this.playerService.deleteById(id);
    }

}

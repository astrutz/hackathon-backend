import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';

@Controller('/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {
  }

  @Get()
  async getAll(@Query('sort') sort?: string): Promise<any[]> {
    return this.playerService.findAll(sort);
  }

  @Get('/:id')
  async getPlayerById(@Param('id') id: number): Promise<Player> {
    return this.playerService.findById(id);
  }

  @Get('/:id/history')
  getPlayerHistory(@Param('id') id: number): any {
    return this.playerService.getPlayerScoreHistory(id);
  }

  @Delete(':id')
  async deletePlayerById(@Param('id') id: number): Promise<void> {
    await this.playerService.deleteById(id);
  }

}

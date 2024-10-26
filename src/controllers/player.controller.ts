import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Delete('/:id')
  async deletePlayerById(@Param('id') id: number): Promise<void> {
    await this.playerService.deleteById(id);
  }

  @Patch("/:id/image")
  @UseInterceptors(FileInterceptor('image')) // Use interceptor to handle the file upload
  async patchPlayerImage(@Param('id') id: number,
                  @UploadedFile() image: Express.Multer.File): Promise<void> {
    this.playerService.updateImage(id, image);
  }

  @Patch("/:id/name")
  async patchPlayerName(@Param('id') id: number,
                  @Body() patchData: { name: string }): Promise<void> {
    const { name } = patchData;
    if (await this.playerService.existPlayerByName(name.trim())) {
      throw new BadRequestException('Player with this name exists already');
    } else if (!name || name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }
    this.playerService.updateName(id, name);
  }
}

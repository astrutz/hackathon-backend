import { Body, Controller, Delete, Get, Param, Patch, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
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

  @Patch("/:id")
  @UseInterceptors(FileInterceptor('image')) // Use interceptor to handle the file upload
  patchPlayerById(@Param('id') id: number,
                  @Body() formData: { name: string },
                  @UploadedFile() image: Express.Multer.File): any {
    const { name } = formData;

    this.playerService.updateName(id, name);
    this.playerService.updateImage(id, image);
  }
}

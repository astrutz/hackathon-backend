import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Between, In, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,

    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const team1Players = await this.playerRepository.findBy({ id: In(gameData.team1Players) });
    const team2Players = await this.playerRepository.findBy({ id: In(gameData.team2Players) });

    console.log("huhu", team1Players, team2Players);
    if (team1Players.length < 1 || team2Players.length < 1) {
      throw new BadRequestException("test");
    }

    const game = this.gameRepository.create({
      ...gameData,
      team1Players,
      team2Players,
    });
    return this.gameRepository.save(game);
  }

  async findById(id: number): Promise<Game> {
    return this.gameRepository.findOneBy({ id: id });
  }

  async deleteById(id: number): Promise<void> {
    await this.gameRepository.delete({ id: id });
  }

  async findByWeek(weeknr: number, year: number): Promise<Game[]> {
    const startDate = this.startOfWeek(year, weeknr, 1);
    const endDate = this.endOfWeek(year, weeknr, 1);

    return this.gameRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
    });
  }

  /**
   * Helper method to calculate the start date of a specific week in a year.
   * @param year - The year.
   * @param weeknr - The calendar week number.
   * @param weekStartsOn - The day the week starts on, 0 for Sunday, 1 for Monday, etc. (defaults to Monday).
   * @returns The start date of the specified week.
   */
  private startOfWeek(year: number, weeknr: number, weekStartsOn: number = 1): Date {
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay();
    const diff = (jan1DayOfWeek <= weekStartsOn ? 0 : 7) - jan1DayOfWeek + weekStartsOn;
    const firstWeekStart = new Date(year, 0, 1 + diff);
    const weekStartDate = new Date(firstWeekStart);
    weekStartDate.setDate(firstWeekStart.getDate() + (weeknr - 1) * 7);

    return weekStartDate;
  }

  /**
   * Helper method to calculate the end date of a specific week in a year.
   * @param year - The year.
   * @param weeknr - The calendar week number.
   * @param weekStartsOn - The day the week starts on, 0 for Sunday, 1 for Monday, etc. (defaults to Monday).
   * @returns The end date of the specified week.
   */
  private endOfWeek(year: number, weeknr: number, weekStartsOn: number = 1): Date {
    const weekStartDate = this.startOfWeek(year, weeknr, weekStartsOn);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    return weekEndDate;
  }
}

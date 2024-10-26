import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Between, In, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { GameResponse } from '../entities/game.response.interface';


@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {
  }

  async findAll(): Promise<GameResponse[]> {
    const games = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.team1Players', 'team1Players')
      .leftJoinAndSelect('game.team2Players', 'team2Players')
      .select([
        'game.id',
        'game.timestamp',
        'game.scoreTeam1',
        'game.scoreTeam2',
        'team1Players.id',
        'team2Players.id',
      ])
      .getMany();

    // Transforming the response to map team player arrays to IDs only
    return games.map(game => ({
      ...game,
      team1Players: game.team1Players.map(player => player.id),
      team2Players: game.team2Players.map(player => player.id),
    }));
  }

  calcPointsBillo(team1Players: Player[], team2Players: Player[], gameData: Partial<Game>): void {
    const WIN_POINTS_BILLO: number = 10;
    const LOST_POINTS_BILLO: number = -5;
    const TIED_POINTS_BILLO: number = 2;

    const hasTeam1Won: boolean = gameData.scoreTeam1 > gameData.scoreTeam2;
    const hasTeam2Won: boolean = gameData.scoreTeam1 < gameData.scoreTeam2;

    if (hasTeam1Won) {
      team1Players.forEach(player => player.scores.billo += WIN_POINTS_BILLO);
      team2Players.forEach(player => player.scores.billo += LOST_POINTS_BILLO);
    } else if (hasTeam2Won) {
      team1Players.forEach(player => player.scores.billo += LOST_POINTS_BILLO);
      team2Players.forEach(player => player.scores.billo += WIN_POINTS_BILLO);
    } else {
      [...team1Players, ...team2Players].forEach(player => player.scores.billo += TIED_POINTS_BILLO);
    }
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const team1Players = await this.playerRepository.findBy({ id: In(gameData.team1Players ?? []) }) ?? [];
    const team2Players = await this.playerRepository.findBy({ id: In(gameData.team2Players ?? []) }) ?? [];

    // validation
    if (team1Players.length < 1 || team2Players.length < 1) {
      throw new BadRequestException('must enter players');
    } else if (this.haveIntersection(team1Players, team2Players)) {
      throw new BadRequestException('players must be disjunct');
    }

    this.calcPointsBillo(team1Players, team2Players, gameData);

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

  private haveIntersection(arr1, arr2) {
    return arr1.some(element => arr2.includes(element));
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Between, In, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { GameResponse } from '../entities/game.response.interface';

interface EloScoreInput {
  team1: { playerId: number; elo: number }[];
  team2: { playerId: number; elo: number }[];
  team1Won: boolean;
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

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

    return games.map(game => ({
      ...game,
      team1Players: game.team1Players.map(player => player.id),
      team2Players: game.team2Players.map(player => player.id),
    }));
  }

  updatePointsBillo(team1Players: Player[], team2Players: Player[], gameData: Partial<Game>): void {
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

    [...team1Players, ...team2Players].forEach(player => this.playerRepository.save(player));
  }

  calculateElo(scores: EloScoreInput, kFactor: number = 32): { playerId: number; newElo: number }[] {
    const { team1, team2, team1Won } = scores;

    const averageEloTeam1 = team1.reduce((sum, player) => sum + player.elo, 0) / team1.length;
    const averageEloTeam2 = team2.reduce((sum, player) => sum + player.elo, 0) / team2.length;

    const expectedScoreTeam1 = 1 / (1 + Math.pow(10, (averageEloTeam2 - averageEloTeam1) / 400));
    const expectedScoreTeam2 = 1 - expectedScoreTeam1;

    const actualScoreTeam1 = team1Won ? 1 : 0;
    const actualScoreTeam2 = 1 - actualScoreTeam1;

    const updatedTeam1 = team1.map(player => {
      const newElo = player.elo + kFactor * (actualScoreTeam1 - expectedScoreTeam1);
      return { playerId: player.playerId, newElo: Math.round(newElo) };
    });

    const updatedTeam2 = team2.map(player => {
      const newElo = player.elo + kFactor * (actualScoreTeam2 - expectedScoreTeam2);
      return { playerId: player.playerId, newElo: Math.round(newElo) };
    });

    return [...updatedTeam1, ...updatedTeam2];
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const team1Players = await this.playerRepository.findBy({ id: In(gameData.team1Players ?? []) }) ?? [];
    const team2Players = await this.playerRepository.findBy({ id: In(gameData.team2Players ?? []) }) ?? [];

    if (team1Players.length < 1 || team2Players.length < 1) {
      throw new BadRequestException('must enter players');
    } else if (this.haveIntersection(team1Players, team2Players)) {
      throw new BadRequestException('players must be disjunct');
    }

    this.updatePointsBillo(team1Players, team2Players, gameData);

    const team1Won = gameData.scoreTeam1 > gameData.scoreTeam2;
    const eloInput = {
      team1: team1Players.map(player => ({ playerId: player.id, elo: player.scores.elo })),
      team2: team2Players.map(player => ({ playerId: player.id, elo: player.scores.elo })),
      team1Won,
    };

    const updatedEloScores = this.calculateElo(eloInput);
    updatedEloScores.forEach(({ playerId, newElo }) => {
      const player = [...team1Players, ...team2Players].find(p => p.id === playerId);
      if (player) {
        player.scores.elo = newElo;
        this.playerRepository.save(player);
      }
    });

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

  private startOfWeek(year: number, weeknr: number, weekStartsOn: number = 1): Date {
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay();
    const diff = (jan1DayOfWeek <= weekStartsOn ? 0 : 7) - jan1DayOfWeek + weekStartsOn;
    const firstWeekStart = new Date(year, 0, 1 + diff);
    const weekStartDate = new Date(firstWeekStart);
    weekStartDate.setDate(firstWeekStart.getDate() + (weeknr - 1) * 7);

    return weekStartDate;
  }

  private endOfWeek(year: number, weeknr: number, weekStartsOn: number = 1): Date {
    const weekStartDate = this.startOfWeek(year, weeknr, weekStartsOn);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    return weekEndDate;
  }

  private haveIntersection(arr1: Player[], arr2: Player[]): boolean {
    return arr1.some(player1 => arr2.some(player2 => player1.id === player2.id));
  }
}

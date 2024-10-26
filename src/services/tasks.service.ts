import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';
import { ScoreHistory } from '../entities/score-history.interface';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
  }

  @Cron("0 50 23 * * 7") // at 23:50 on Sunday
  async saveWeeklyScore() {
    console.log('Saving weekly elo scores');

    const allPlayers: Player[] = await this.playerRepository.find();
    allPlayers.forEach(player => {
      const now = new Date();
      const historyEntry: ScoreHistory = {
        year: now.getFullYear(),
        week: this.getWeekNumber(now),
        elo: player.scores.elo,
        billo: player.scores.billo,
      };

      const existingHistoryEntry: ScoreHistory[] = player.scoreHistory ? player.scoreHistory.filter(entry =>
        entry.week === this.getWeekNumber(now) && entry.year === now.getFullYear()
      ) : [];
      if (existingHistoryEntry.length > 0) {
        // already has score entry this week, update it
        existingHistoryEntry[0].elo = player.scores.elo;
      } else {
        // No entry for this week, add new history entry
        if (!player.scoreHistory) {
          player.scoreHistory = [];
        }
        player.scoreHistory.push(historyEntry);
      }

      this.playerRepository.save(player);
    });
  }

  private getWeekNumber(date: Date): number {
    // Set the start of the week as Monday and clone the date to avoid mutations
    const target = new Date(date.valueOf());
    target.setHours(0, 0, 0, 0);

    // Find the Thursday in the current week to get consistent results
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));

    // January 4th is always in the first week of the ISO calendar year
    const firstThursday = new Date(target.getFullYear(), 0, 4);

    // Calculate the number of weeks between the target date and the first Thursday
    const diff = target.getTime() - firstThursday.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in a week

    // Calculate the calendar week number
    return 1 + Math.floor(diff / oneWeek);
  }
}

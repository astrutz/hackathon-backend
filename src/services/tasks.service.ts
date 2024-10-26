import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
    const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNum = (tempDate.getDay() + 6) % 7; // Adjust so that Monday is day 0 and Sunday is day 6

    // Set tempDate to the nearest Thursday to determine the first week of the year
    tempDate.setDate(tempDate.getDate() - dayNum + 3);

    // Calculate the first Thursday of the year
    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    const firstWeekStart = firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3;

    const startOfYear = new Date(tempDate.getFullYear(), 0, firstWeekStart);

    // Calculate week number
    return Math.ceil(((tempDate.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
  }
}

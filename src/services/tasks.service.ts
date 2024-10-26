import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';
import { ScoreHistory } from '../entities/score-history.interface';
import { PlayerService } from './player.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,

    @Inject()
    private readonly playerService: PlayerService,
  ) {
  }

  @Cron("0 50 23 * * 7") // at 23:50 on Sunday
  async saveWeeklyScore() {
    console.log('Saving weekly elo scores');

    const allPlayers: Player[] = await this.playerRepository.find();
    allPlayers.forEach(player => {

      const historyEntry: ScoreHistory = this.playerService.getCurrentHistoryEntry(player);

      const existingHistoryEntry: ScoreHistory[] = player.scoreHistory ? player.scoreHistory.filter(entry =>
        entry.week === historyEntry.week && entry.year === historyEntry.year
      ) : [];
      if (existingHistoryEntry.length > 0) {
        // already has score entry this week, update it
        existingHistoryEntry[0].elo = player.scores.elo;
        existingHistoryEntry[0].billo = player.scores.billo;
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
}

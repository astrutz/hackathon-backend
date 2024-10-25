import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class Game {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column()
  team1Players: Player[];

  @Column()
  team2Players: Player[];

  @Column()
  scoreTeam1: number;

  @Column()
  scoreTeam2: number;

}

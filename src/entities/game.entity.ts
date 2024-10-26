import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @ManyToMany(() => Player, (player) => player.gamesInTeam1, { nullable: true })
  team1Players: Player[];

  @ManyToMany(() => Player, (player) => player.gamesInTeam2, { nullable: true })
  team2Players: Player[];

  @Column()
  scoreTeam1: number;

  @Column()
  scoreTeam2: number;

}

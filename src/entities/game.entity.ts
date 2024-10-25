import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class Game {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @ManyToMany(() => Player)
  @JoinTable()
  team1Players: Player[];

  @ManyToMany(() => Player)
  @JoinTable()
  team2Players: Player[];

  @Column()
  scoreTeam1: number;

  @Column()
  scoreTeam2: number;

}

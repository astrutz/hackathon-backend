import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Score } from './score.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  alias: string;

  @Column()
  won: number;

  @Column()
  lost: number;

  @ManyToMany(() => Game)
  @JoinTable()
  games: Game[];

  @Column()
  scores: Score;
}

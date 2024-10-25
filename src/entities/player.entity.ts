import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Score } from './score.interface';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
      nullable: true,})
  won: number;

  @Column({
      nullable: true,})
  lost: number;

  @ManyToMany((nullable: true) => Game)
  @JoinTable()
  games: Game[];

  @Column("json", {
      nullable: true,})
  scores: Score;
}

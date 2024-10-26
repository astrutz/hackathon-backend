import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Score } from './score.interface';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  won: number;

  @Column({ nullable: true })
  lost: number;

  @ManyToMany(() => Game, (game) => game.team1Players, { nullable: true })
  @JoinTable()
  gamesInTeam1: Game[];

  @ManyToMany(() => Game, (game) => game.team2Players, { nullable: true })
  @JoinTable()
  gamesInTeam2: Game[];

  get games(): Game[] {
    return [...this.gamesInTeam1, ...this.gamesInTeam2];
  }

  @Column("json", { nullable: true })
  scores: Score;
}

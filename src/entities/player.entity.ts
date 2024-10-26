import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Score } from './score.interface';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  won: number = 0;

  @Column({ nullable: true })
  lost: number = 0;

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
  scores: Score = { elo: 1000, glicko: 1500, billo: 0 };
}

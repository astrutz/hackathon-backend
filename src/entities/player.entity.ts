import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';

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

  @Column()
  games: Game[];

  @Column()
  scores:{
      elo: number;
      glicko: number;
      billo: number
      }
}

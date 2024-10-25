import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  elo: number;

  @Column()
  glicko: number;

  @Column()
  billo: number;

}

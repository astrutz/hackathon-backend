import { IsNumber, IsString } from 'class-validator';

export class ScoreHistoryDto {
  @IsString()
  week: string;

  @IsNumber()
  score: number;
}

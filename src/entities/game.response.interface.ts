export interface GameResponse {
  id: number;
  timestamp: Date;
  scoreTeam1: number;
  scoreTeam2: number;
  team1Players: number[];
  team2Players: number[];
}

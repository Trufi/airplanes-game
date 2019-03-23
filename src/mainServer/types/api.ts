import { Tournament, UserStats } from '../models/types';

export type GamelistResponse = Array<{
  type: string;
  city: string;
  players: number;
  maxPlayers: number;
  url: string;
}>;

export interface TournamentListResponse {
  tournaments: Tournament[];
}

export interface LadderResponse {
  ladder: UserStats[];
}

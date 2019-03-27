import { Tournament, UserStats } from '../models/types';
import { GameType } from '../../types';

export type GamelistResponse = Array<{
  type: GameType;
  enable: boolean;
  isGrandFinal: boolean;
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

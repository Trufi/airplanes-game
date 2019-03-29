import { Pretender, Tournament, UserStats } from '../models/types';
import { GameType, City } from '../../types';

export interface GamelistItem {
  type: GameType;
  enable: boolean;
  isGrandFinal: boolean;
  city: City;
  players: number;
  maxPlayers: number;
  url: string;
}

export type GamelistResponse = GamelistItem[];

export interface TournamentListResponse {
  tournaments: Tournament[];
}

export interface PretenderListResponse {
  pretenders: Pretender[];
}

export interface LadderResponse {
  ladder: UserStats[];
}

export interface CanIjoinToGrandFinalResponse {
  can: boolean;
}

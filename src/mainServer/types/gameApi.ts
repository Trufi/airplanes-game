import { GameType } from '../../types';

export interface NotifyRequest {
  url: string;
  city: string;
  type: GameType;
  players: number;
  tournamentId: number;
  maxPlayers: number;
  enable: boolean;
  isGrandFinal: boolean;
}

export interface PlayerRequest {
  gameUrl: string;
  playerToken: string;
  toFinal: boolean;
}

export interface PlayerResponse {
  id: number;
  name: string;
}

export interface AddPlayerStatsRequest {
  kills: number;
  deaths: number;
  points: number;
  tournamentId: number;
}

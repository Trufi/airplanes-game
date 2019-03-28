import { GameType, City } from '../../types';

export interface NotifyRequest {
  url: string;
  city: City;
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
  tournamentId: number;
}

export interface PlayerResponse {
  id: number;
  name: string;
  deaths: number;
  kills: number;
  points: number;
}

export interface AddPlayerStatsRequest {
  kills: number;
  deaths: number;
  points: number;
  tournamentId: number;
}

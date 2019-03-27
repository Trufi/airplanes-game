import { GameType } from '../../types';

export interface NotifyRequest {
  url: string;
  type: GameType;
  city: string;
  players: number;
  tournamentId: number;
  maxPlayers: number;
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

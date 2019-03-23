import { GameType } from '../../types';

export interface Game {
  id: number;
  type: GameType;
  url: string;
  players: number;
  maxPlayers: number;
  city: string;
  lastNotifyTime: number;
  tournamentId: number;
}

export interface State {
  games: {
    nextId: number;
    map: Map<number, Game>;
    byUrl: Map<string, Game>;
  };
}

import { State } from './types';
import { GameType, City } from '../types';
import * as game from './games/game';

export const createState = (
  settings: {
    url: string;
    type: GameType;
    maxPlayers: number;
    city: City;
    duration: number;
  },
  time: number,
  tournamentId: number,
): State => {
  const { url, type, maxPlayers, city, duration } = settings;
  return {
    url,
    type,
    connections: {
      map: new Map(),
      nextId: 1,
    },
    game: game.createGameState(time, maxPlayers, duration, city, tournamentId),
  };
};

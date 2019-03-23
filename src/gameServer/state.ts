import { State } from './types';
import { GameType } from '../types';
import * as game from './games/game';

export const createState = (
  settings: {
    url: string;
    type: GameType;
    maxPlayers: number;
    city: string;
    duration: number;
  },
  time: number,
): State => {
  const { url, type, maxPlayers, city, duration } = settings;
  return {
    url,
    type,
    city,
    connections: {
      map: new Map(),
      nextId: 1,
    },
    game: game.createGameState(time, maxPlayers, duration),
  };
};

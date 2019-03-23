import { State } from './types';
import { GameType } from '../types';
import * as game from './games/game';

export const createState = (
  settings: {
    url: string;
    type: GameType;
    maxPlayers: number;
    city: string;
  },
  time: number,
): State => {
  const { url, type, maxPlayers, city } = settings;
  return {
    url,
    type,
    maxPlayers,
    city,
    connections: {
      map: new Map(),
      nextId: 1,
    },
    game: game.createGameState(time),
  };
};

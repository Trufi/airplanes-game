import { State } from './types';
import { GameType } from '../types';

export const createState = (settings: {
  url: string;
  type: GameType;
  maxPlayers: number;
  city: string;
}): State => {
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
    games: {
      map: new Map(),
      nextId: 1,
    },
  };
};

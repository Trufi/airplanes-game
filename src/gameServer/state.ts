import { State } from './types';

export const createState = (token: string): State => {
  return {
    token,
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

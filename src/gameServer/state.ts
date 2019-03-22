import { State } from './types';

export const createState = (): State => {
  return {
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

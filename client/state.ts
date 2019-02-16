import { State } from './types';
import { createScene } from './view';

export const createState = (time: number): State => {
  return {
    time,
    prevTime: 0,
    players: new Map(),
    bodies: new Map(),
    scene: createScene(),
    serverTime: {
      diff: 0,
      ping: 300,
    },
  };
};

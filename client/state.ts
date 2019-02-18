import { State } from './types';
import { createScene, createCamera } from './view';

export const createState = (time: number): State => {
  return {
    time,
    prevTime: 0,
    players: new Map(),
    bodies: new Map(),
    scene: createScene(),
    camera: createCamera(),
    serverTime: {
      diff: 0,
      ping: 300,
    },
    pressedKeys: {},
  };
};

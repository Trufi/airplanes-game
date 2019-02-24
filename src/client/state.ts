import { State } from './types';
import { createScene, createCamera, createMap } from './view';
import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import * as config from '../config';

export const createState = (time: number): State => {
  const mapOrigin = projectGeoToMap(config.origin);

  return {
    time,
    prevTime: 0,
    origin: [mapOrigin[0], mapOrigin[1], 0],
    players: new Map(),
    bodies: new Map(),
    scene: createScene(),
    map: createMap(),
    camera: createCamera(),
    serverTime: {
      diffSample: [],
      diff: 0,

      pingSample: [],
      ping: 300,
    },
    pressedKeys: {},
    deathNotes: [],
  };
};

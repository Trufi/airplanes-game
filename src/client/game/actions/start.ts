import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import { State } from '../../types';
import { createScene, createCamera, createMap } from './../view';
import * as config from '../../../config';
import { ServerMsg } from '../../../server/messages';
import { createPlayer, createPhysicBody, createNonPhysicBody } from '../common';

export const start = (time: number, data: ServerMsg['startData']): State => {
  const { playerId, players, bodies } = data;
  const mapOrigin = projectGeoToMap(config.origin);

  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`Player with id ${playerId} not found in players`);
  }

  const { bodyId, live } = player;

  const state: State = {
    playerId,
    bodyId,
    time,
    prevTime: time,
    name,
    origin: [mapOrigin[0], mapOrigin[1], 0],
    live,
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
    stick: { x: 0, y: 0 },
  };

  bodies.forEach((body) => {
    // Физику эмулируем только для себя
    if (body.id === bodyId) {
      createPhysicBody(state, body);
    } else {
      createNonPhysicBody(state, body);
    }
  });

  players.forEach((p) => {
    createPlayer(state, p);

    // Добавляем к телам игроков их id, вдруг пригодится
    const body = state.bodies.get(p.bodyId);
    if (body) {
      body.playerId = p.id;
    }
  });

  return state;
};

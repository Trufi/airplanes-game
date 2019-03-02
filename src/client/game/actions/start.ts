import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import { State, PlayerState, PhysicBodyState } from '../../types';
import { createScene, createCamera, createMap } from './../view';
import * as config from '../../../config';
import { ServerMsg } from '../../../server/messages';
import { createPlayer, createPhysicBody, createNonPhysicBody, addBody } from '../common';

export const start = (time: number, data: ServerMsg['startData']): State => {
  const mapOrigin = projectGeoToMap(config.origin);

  const players: State['players'] = new Map();
  let currentPlayer: PlayerState | undefined;
  let currentBody: PhysicBodyState | undefined;

  data.players.forEach((playerData) => {
    const player = createPlayer(playerData);
    players.set(player.id, player);

    if (data.playerId === player.id) {
      currentPlayer = player;
    }
  });

  const bodies: State['bodies'] = new Map();
  data.bodies.forEach((bodyData) => {
    if (currentPlayer && bodyData.id === currentPlayer.bodyId) {
      const body = createPhysicBody(bodyData);
      currentBody = body;
      bodies.set(body.id, body);
    } else {
      const body = createNonPhysicBody(bodyData);
      bodies.set(body.id, body);
    }
  });

  if (!currentPlayer || !currentBody) {
    throw new Error('Current player and body not found');
  }

  const state: State = {
    time,
    prevTime: time,
    player: currentPlayer,
    body: currentBody,
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
    stick: { x: 0, y: 0 },
  };

  bodies.forEach((body) => addBody(state, body));

  return state;
};

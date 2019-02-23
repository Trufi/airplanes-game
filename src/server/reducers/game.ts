import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { Cmd, cmd } from '../commands';
import { msg } from '../messages';
import { findMap, clamp, mapMap } from '../../utils';
import { ClientMsg } from '../../client/messages';
import * as config from '../../config';
import { Hit } from '../../client/types';

export interface Weapon {
  lastShotTime: number;
}

export interface Airplane {
  id: number;
  playerId: number;
  updateTime: number;
  position: number[];
  rotation: number[];
  velocity: number;
  velocityDirection: number[];
  health: number;
  weapon: Weapon;
}

export interface BodiesState {
  map: Map<number, Airplane>;
  nextId: number;
}

export interface GamePlayer {
  /**
   * id равен connectionId
   */
  id: number;
  name: string;
  bodyId: number;
}

export interface GameState {
  id: number;
  prevTime: number;
  time: number;
  bodies: BodiesState;
  players: Map<number, GamePlayer>;
}

export const debugInfo = ({ id, bodies, players }: GameState) => ({
  id,
  bodies: Array.from(bodies.map),
  players: Array.from(players),
});

const gameConnectionIds = (gameState: GameState) => {
  return mapMap(gameState.players, (gp) => gp.id);
};

export const createGameState = (id: number, time: number): GameState => {
  return {
    id,
    prevTime: time,
    time,
    bodies: {
      nextId: 1,
      map: new Map(),
    },
    players: new Map(),
  };
};

const createAirplane = (id: number, playerId: number): Airplane => {
  return {
    id,
    playerId,
    updateTime: 0,
    position: [0, 0, 50000],
    rotation: [0, 0, 0, 1],
    velocity: 10,
    velocityDirection: [0, 0, 0],
    health: 100,
    weapon: {
      lastShotTime: 0,
    },
  };
};

export const tick = (game: GameState, time: number): Cmd => {
  game.prevTime = game.time;
  game.time = time;

  return cmd.sendMsgTo(gameConnectionIds(game), msg.tickData(game));
};

export const joinPlayer = (game: GameState, id: number, name: string): Cmd => {
  const body = createAirplane(game.bodies.nextId, id);
  game.bodies.nextId++;
  game.bodies.map.set(body.id, body);

  const gamePlayer: GamePlayer = {
    id,
    bodyId: body.id,
    name,
  };
  game.players.set(id, gamePlayer);

  return [
    cmd.sendMsg(id, msg.startData(game, gamePlayer, body)),
    cmd.sendMsgTo(gameConnectionIds(game), msg.playerEnter(gamePlayer, body)),
  ];
};

export const kickPlayer = (game: GameState, id: number): Cmd => {
  game.players.delete(id);
  const body = findMap(game.bodies.map, (body) => body.playerId === id);
  if (body) {
    game.bodies.map.delete(body.id);
  }

  return cmd.sendMsgTo(gameConnectionIds(game), msg.playerLeave(id));
};

const updatePlayerBodyState = (
  body: Airplane,
  clientBody: ClientMsg['changes']['body'],
  updateTime: number,
): Cmd => {
  body.updateTime = updateTime;
  vec3.copy(body.position, clientBody.position);
  body.velocity = clientBody.velocity;
  vec3.copy(body.velocityDirection, clientBody.velocityDirection);
  quat.copy(body.rotation, clientBody.rotation);
  body.weapon.lastShotTime = clientBody.weapon.lastShotTime;
};

const applyHit = (game: GameState, hit: Hit) => {
  const { bodyId } = hit;
  const body = game.bodies.map.get(bodyId);
  if (!body) {
    return;
  }

  body.health = clamp(body.health - config.weapon.damage, 0, config.airplane.maxHealth);
};

export const updatePlayerChanges = (
  game: GameState,
  playerId: number,
  clientMsg: ClientMsg['changes'],
) => {
  const gamePlayer = game.players.get(playerId);
  if (!gamePlayer) {
    return;
  }

  const body = game.bodies.map.get(gamePlayer.bodyId);
  if (!body) {
    return;
  }

  updatePlayerBodyState(body, clientMsg.body, clientMsg.time);

  clientMsg.body.weapon.hits.forEach((hit) => applyHit(game, hit));
};

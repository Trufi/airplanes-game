import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { Cmd, cmd, union } from '../commands';
import { msg } from '../messages';
import { findMap, clamp, mapMap, vec2SignedAngle } from '../../utils';
import { ClientMsg } from '../../client/messages';
import * as config from '../../config';
import { Hit } from '../../client/types';
import { updatePointsByType } from './calcPoints';

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
  live: boolean;
  kills: number;
  deaths: number;
  points: number;
}

export interface GameObserver {
  /**
   * id равен connectionId
   */
  id: number;
  name: string;
}

export interface GameState {
  id: number;
  prevTime: number;
  time: number;
  bodies: BodiesState;
  players: Map<number, GamePlayer>;
  observers: Map<number, GameObserver>;
}

export const debugInfo = ({ id, bodies, players }: GameState) => ({
  id,
  bodies: Array.from(bodies.map),
  players: Array.from(players),
});

const tickBodyRecipientIds = (gameState: GameState) => {
  return [...mapMap(gameState.players, (p) => p.id), ...mapMap(gameState.observers, (o) => o.id)];
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
    observers: new Map(),
  };
};

const getStartPlayerPosition = (): number[] => {
  const angle = Math.random() * Math.PI * 2;
  return [
    Math.cos(angle) * config.resurrection.radius,
    Math.sin(angle) * config.resurrection.radius,
    config.resurrection.height,
  ];
};

const forward = [0, 1];
const toCenter = [0, 0];
const getStartPlayerRotation = (position: number[]): number[] => {
  toCenter[0] = -position[0];
  toCenter[1] = -position[1];

  const angle = vec2SignedAngle(forward, toCenter);
  const rotation = [0, 0, 0, 1];

  quat.rotateZ(rotation, rotation, angle);
  return rotation;
};

const createAirplane = (id: number, playerId: number): Airplane => {
  const position = getStartPlayerPosition();

  return {
    id,
    playerId,
    updateTime: 0,
    position,
    rotation: getStartPlayerRotation(position),
    velocity: config.airplane.velocity,
    health: config.airplane.maxHealth,
    weapon: {
      lastShotTime: 0,
    },
  };
};

export const tick = (game: GameState, time: number): Cmd => {
  game.prevTime = game.time;
  game.time = time;

  // Если от пользователей довно не приходило сообщений, то убиваем их
  game.bodies.map.forEach((body) => {
    if (body.updateTime !== 0 && game.time - body.updateTime > 10000) {
      playerDeath(game, body, 0);
    }
  });

  return cmd.sendMsgTo(tickBodyRecipientIds(game), msg.tickData(game));
};

export const joinPlayer = (game: GameState, id: number, name: string): Cmd => {
  const body = createAirplane(game.bodies.nextId, id);
  game.bodies.nextId++;
  game.bodies.map.set(body.id, body);

  const gamePlayer: GamePlayer = {
    id,
    bodyId: body.id,
    name,
    live: true,
    kills: 0,
    deaths: 0,
    points: 0,
  };
  game.players.set(id, gamePlayer);

  return [
    cmd.sendMsg(id, msg.startData(game, gamePlayer)),
    cmd.sendMsgTo(tickBodyRecipientIds(game), msg.playerEnter(gamePlayer, body)),
  ];
};

export const playerRestart = (game: GameState, id: number): Cmd => {
  const player = game.players.get(id);

  if (!player || player.live) {
    return;
  }

  const body = createAirplane(game.bodies.nextId, id);
  game.bodies.nextId++;
  game.bodies.map.set(body.id, body);

  player.bodyId = body.id;
  player.live = true;

  return cmd.sendMsgTo(tickBodyRecipientIds(game), msg.playerNewBody(player, body));
};

export const kickPlayer = (game: GameState, id: number): Cmd => {
  game.players.delete(id);
  const body = findMap(game.bodies.map, (body) => body.playerId === id);
  if (body) {
    game.bodies.map.delete(body.id);
  }

  return cmd.sendMsgTo(tickBodyRecipientIds(game), msg.playerLeave(id));
};

const updatePlayerBodyState = (
  body: Airplane,
  clientBody: ClientMsg['changes']['body'],
  updateTime: number,
): Cmd => {
  body.updateTime = updateTime;
  vec3.copy(body.position, clientBody.position);
  body.velocity = clientBody.velocity;
  quat.copy(body.rotation, clientBody.rotation);
  body.weapon.lastShotTime = clientBody.weapon.lastShotTime;
};

const playerDeath = (game: GameState, body: Airplane, causePlayerId: number): Cmd => {
  const cmds: Cmd = [];

  const causePlayer = game.players.get(causePlayerId);
  if (causePlayer) {
    causePlayer.kills++;
    updatePointsByType(causePlayer, 'kills');
  }

  // Превращаем живого игрока в мертвого
  const player = game.players.get(body.playerId);
  if (player) {
    player.live = false;
    player.deaths++;
    updatePointsByType(player, 'deaths');

    // TODO: если игра на вылет, то тут нужно как-то прокинуть команду
    // чтобы игрока выкинуло из игры

    // Сообщаем игрокам
    cmds.push(cmd.sendMsgTo(tickBodyRecipientIds(game), msg.playerDeath(player.id, causePlayerId)));
  }

  // Удаляем тело
  game.bodies.map.delete(body.id);

  return cmds;
};

const applyHit = (game: GameState, hit: Hit, causePlayerId: number): Cmd => {
  const { bodyId } = hit;
  const body = game.bodies.map.get(bodyId);
  if (!body) {
    return;
  }

  // рандомный дамаг
  const damage = Math.floor(Math.random() * config.weapon.damage) + 1;
  body.health = clamp(body.health - damage, 0, config.airplane.maxHealth);

  if (body.health <= 0) {
    return playerDeath(game, body, causePlayerId);
  }
};

export const updatePlayerChanges = (
  game: GameState,
  playerId: number,
  clientMsg: ClientMsg['changes'],
): Cmd => {
  const gamePlayer = game.players.get(playerId);
  if (!gamePlayer || !gamePlayer.live) {
    return;
  }

  const body = game.bodies.map.get(gamePlayer.bodyId);
  if (!body) {
    return;
  }

  updatePlayerBodyState(body, clientMsg.body, clientMsg.time);

  const cmds = clientMsg.body.weapon.hits.map((hit) => applyHit(game, hit, gamePlayer.id));
  return union(cmds);
};

export const joinObserver = (game: GameState, id: number, name: string): Cmd => {
  const gameObserver: GameObserver = {
    id,
    name,
  };
  game.observers.set(id, gameObserver);

  return cmd.sendMsg(id, msg.startObserverData(game));
};

export const kickObserver = (game: GameState, id: number): Cmd => {
  game.observers.delete(id);
};

import * as vec3 from '@2gis/gl-matrix/vec3';
import * as vec4 from '@2gis/gl-matrix/vec4';
import * as quat from '@2gis/gl-matrix/quat';
import { Cmd, cmd, union } from '../commands';
import { msg, pbfMsg } from '../messages';
import { findMap, clamp, mapMap, vec2SignedAngle, mapToArray } from '../../utils';
import { ClientMsg } from '../../client/messages';
import * as config from '../../config';
import { updatePointsByType } from './calcPoints';
import { GameState, Body, GamePlayer, GameObserver } from '../types';

export const debugInfo = (state: GameState) => {
  const { time, bodies, players, observers, startTime, duration, maxPlayers } = state;
  return {
    time,
    bodies: mapToArray(bodies.map),
    players: mapToArray(players),
    observers: mapToArray(observers),
    startTime,
    duration,
    maxPlayers,
  };
};

const tickBodyRecipientIds = (gameState: GameState) => {
  return [...mapMap(gameState.players, (p) => p.id), ...mapMap(gameState.observers, (o) => o.id)];
};

export const createGameState = (time: number, maxPlayers: number, duration: number): GameState => {
  return {
    prevTime: time,
    time,
    bodies: {
      nextId: 1,
      map: new Map(),
    },
    players: new Map(),
    observers: new Map(),
    restart: {
      need: false,
      time: 0,
    },
    startTime: time,
    duration,
    maxPlayers,
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

const createAirplane = (id: number, playerId: number): Body => {
  const position = getStartPlayerPosition();
  const rotation = getStartPlayerRotation(position);

  return {
    id,
    playerId,
    updateTime: 0,
    position,
    rotation,
    health: config.airplane.maxHealth,
    weapon: {
      lastShotTime: 0,
    },
    prevSendingData: {
      position: position.slice(),
      rotation: rotation.slice(),
      updateTime: 0,
      lastShotTime: 0,
    },
  };
};

export const tick = (game: GameState, time: number): Cmd => {
  game.prevTime = game.time;
  game.time = time;

  // Если от пользователей довно не приходило сообщений, то убиваем их
  // game.bodies.map.forEach((body) => {
  //   if (body.updateTime !== 0 && game.time - body.updateTime > 10000) {
  //     playerDeath(game, body, 0);
  //   }
  // });

  const cmds: Cmd[] = [];

  cmds.push(cmd.sendPbfMsgTo(tickBodyRecipientIds(game), pbfMsg.tickData(game)));

  if (game.restart.need && game.time > game.restart.time) {
    game.restart.need = false;
    cmds.push(restart(game));
  }

  return union(cmds);
};

export const canJoinPlayer = (game: GameState, userId: number) => {
  if (game.players.size >= game.maxPlayers) {
    return false;
  }
  const hasSamePlayer = findMap(game.players, (p) => p.userId === userId);
  return !hasSamePlayer;
};

export const joinPlayer = (game: GameState, id: number, userId: number, name: string): Cmd => {
  const body = createAirplane(game.bodies.nextId, id);
  game.bodies.nextId++;
  game.bodies.map.set(body.id, body);

  const gamePlayer: GamePlayer = {
    id,
    userId,
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
  body: Body,
  { position, rotation, lastShotTime, time }: ClientMsg['changes'],
): Cmd => {
  body.updateTime = time;
  vec3.set(body.position, position.x, position.y, position.z);
  vec4.set(body.rotation, rotation.x, rotation.y, rotation.z, rotation.w);
  body.weapon.lastShotTime = lastShotTime;
};

const playerDeath = (game: GameState, body: Body, causePlayerId: number): Cmd => {
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

const applyHit = (game: GameState, hitBodyId: number, causePlayerId: number): Cmd => {
  const body = game.bodies.map.get(hitBodyId);
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

  updatePlayerBodyState(body, clientMsg);

  const cmds = clientMsg.hitBodyIds.map((hitBodyId) => applyHit(game, hitBodyId, gamePlayer.id));

  return union(cmds);
};

export const joinObserver = (game: GameState, id: number, userId: number, name: string): Cmd => {
  const gameObserver: GameObserver = {
    id,
    userId,
    name,
  };
  game.observers.set(id, gameObserver);

  return cmd.sendMsg(id, msg.startObserverData(game));
};

export const kickObserver = (game: GameState, id: number): Cmd => {
  game.observers.delete(id);
};

export const restartInSeconds = (game: GameState, inSeconds: number): Cmd => {
  game.restart.need = true;
  game.restart.time = game.time + inSeconds * 1000;

  return cmd.sendMsgTo(tickBodyRecipientIds(game), msg.restartAt(game));
};

const restart = (game: GameState): Cmd => {
  game.startTime = game.time;

  game.bodies.map.forEach((body) => {
    game.bodies.map.delete(body.id);
  });

  game.players.forEach((player) => {
    // сбрасываем очки
    player.kills = 0;
    player.deaths = 0;
    player.points = 0;

    // Выдаем новые тела
    const body = createAirplane(game.bodies.nextId, player.id);
    game.bodies.nextId++;
    game.bodies.map.set(body.id, body);

    player.bodyId = body.id;
    player.live = true;
  });

  return cmd.sendMsgTo(tickBodyRecipientIds(game), msg.restartData(game));
};

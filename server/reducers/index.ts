import * as ws from 'ws';
import { AnyClientMsg, ClientMsg } from '../../client/messages';
import {
  ConnectionsState,
  InitialConnection,
  Player,
  PlayerConnection,
  State,
  Airplane,
  Connection,
} from '../types';
import { Cmd, cmd } from '../commands';
import { msg } from '../messages';
import { time, getBodyByPlayerId, clamp } from '../utils';
import { updatePlayerBodyState } from './bodies';
import { weapon, airplane } from '../../config';
import { Hit } from '../../client/types';

export const createNewConnection = (state: ConnectionsState, socket: ws): number => {
  const connection: InitialConnection = {
    status: 'initial',
    id: state.nextId,
    socket,
  };
  state.nextId++;
  state.map.set(connection.id, connection);
  return connection.id;
};

/**
 * Обработка сообщений клиента
 */
export const message = (state: State, connectionId: number, msg: AnyClientMsg): Cmd => {
  const connection = state.connections.map.get(connectionId);
  if (!connection) {
    return;
  }

  switch (connection.status) {
    case 'initial':
      return initialConnectionMessage(state, connection, msg);
    case 'player':
      return playerConnectionMessage(state, connection, msg);
  }
};

export const initialConnectionMessage = (
  state: State,
  connection: InitialConnection,
  clientMsg: AnyClientMsg,
): Cmd => {
  switch (clientMsg.type) {
    case 'start':
      return playerStart(state, connection, clientMsg);
    case 'ping':
      return pingMessage(clientMsg, connection);
  }
};

const playerStart = (
  state: State,
  connection: InitialConnection,
  clientMsg: ClientMsg['start'],
): Cmd => {
  const body = createAirplane(state.bodies.nextId);
  state.bodies.nextId++;
  state.bodies.map.set(body.id, body);

  const player = createPlayer(state.players.nextId, body.id, connection.id, clientMsg.name);
  state.players.nextId++;
  state.players.map.set(player.id, player);

  state.connections.map.set(connection.id, {
    status: 'player',
    id: connection.id,
    socket: connection.socket,
    playerId: player.id,
  });

  return [
    cmd.sendMsg(msg.startData(state, player, body), connection.id),
    cmd.sendMsgToAll(msg.playerEnter(player)),
  ];
};

export const playerConnectionMessage = (
  state: State,
  connection: PlayerConnection,
  clientMsg: AnyClientMsg,
): Cmd => {
  switch (clientMsg.type) {
    case 'changes':
      return updatePlayerChanges(state, clientMsg, connection.id);
    case 'ping':
      return pingMessage(clientMsg, connection);
  }
};

export const pingMessage = (clientMsg: ClientMsg['ping'], connection: Connection): Cmd => {
  // Да, функция — не чистая, но и пофиг!
  return cmd.sendMsg(msg.pong(time(), clientMsg.time), connection.id);
};

export const createPlayer = (
  id: number,
  bodyId: number,
  connectionId: number,
  name: string,
): Player => {
  return {
    id,
    connectionId,
    name,
    bodyId,
  };
};

const createAirplane = (id: number): Airplane => {
  return {
    id,
    updateTime: 0,
    position: [0, 0, 80000],
    rotation: [0, 0, 0, 1],
    velocity: 10,
    velocityDirection: [0, 0, 0],
    health: 100,
    weapon: {
      lastShotTime: 0,
    },
  };
};

export const connectionLost = (state: State, connectionId: number): Cmd => {
  const connection = state.connections.map.get(connectionId);
  if (!connection) {
    return;
  }
  state.connections.map.delete(connectionId);

  if (connection.status === 'player') {
    const player = state.players.map.get(connection.playerId);
    if (player) {
      state.players.map.delete(player.id);
      state.bodies.map.delete(player.bodyId);
      return cmd.sendMsgToAll(msg.playerLeave(player.id));
    }
  }
};

const updatePlayerChanges = (state: State, msg: ClientMsg['changes'], playerId: number): Cmd => {
  const playerBody = getBodyByPlayerId(state, playerId);
  if (playerBody) {
    updatePlayerBodyState(playerBody, msg.body, msg.time);
  }

  msg.body.weapon.hits.forEach((hit) => applyHit(state, hit));
};

const applyHit = (state: State, hit: Hit) => {
  const { bodyId } = hit;
  const body = state.bodies.map.get(bodyId);
  if (!body) {
    return;
  }

  body.health = clamp(body.health - weapon.damage, 0, airplane.maxHealth);
};

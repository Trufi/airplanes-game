import * as ws from 'ws';
import { AnyClientMsg, ClientMsg } from '../../client/messages';
import {
  ConnectionsState,
  InitialConnection,
  Player,
  PlayerConnection,
  State,
  Airplane,
} from '../types';
import { Cmd, cmd } from '../commands';
import { updatePlayerBodyState } from './bodies';
import { msg } from '../messages';

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
  msg: AnyClientMsg,
): Cmd => {
  switch (msg.type) {
    case 'start': {
      return playerStart(state, connection, msg);
    }
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
  msg: AnyClientMsg,
): Cmd => {
  const player = state.players.map.get(connection.playerId);
  if (!player) {
    return;
  }
  const body = state.bodies.map.get(player.bodyId);
  if (!body) {
    return;
  }

  switch (msg.type) {
    case 'bodyState':
      return updatePlayerBodyState(body, msg);
  }
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
    position: [989279049.1967943, 789621208.6300365, 80000],
    rotation: [0, 0, 0, 1],
    velocity: [0, 10, 0],
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

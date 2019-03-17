import * as ws from 'ws';
import { AnyClientMsg, ClientMsg } from '../../client/messages/index';
import {
  ConnectionsState,
  InitialConnection,
  UserConnection,
  PlayerConnection,
  State,
  Connection,
  ObserverConnection,
} from '../types';
import { Cmd, cmd, union } from '../commands';
import { msg } from '../messages';
import { time } from '../utils';
import * as game from '../games/game';
import { mapMap } from '../../utils';
import { selectUserByToken } from '../models/user';
import { connectionDB } from '../models/database';

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
    case 'user':
      return userConnectionMessage(state, connection, msg);
    case 'player':
      return playerConnectionMessage(state, connection, msg);
    case 'observer':
      return observerConnectionMessage(state, connection, msg);
  }
};

export const initialConnectionMessage = (
  state: State,
  connection: InitialConnection,
  clientMsg: AnyClientMsg,
): Cmd => {
  switch (clientMsg.type) {
    case 'auth':
      return authMessage(state, connection, clientMsg);
    case 'botAuth':
      return botAuthMessage(state, connection, clientMsg);
    case 'ping':
      return pingMessage(clientMsg, connection);
  }
};

const userConnectionMessage = (
  state: State,
  connection: UserConnection,
  clientMsg: AnyClientMsg,
): Cmd => {
  switch (clientMsg.type) {
    case 'joinGame':
      return playerStart(state, connection, clientMsg);
    case 'joinGameAsObserver':
      return observerStart(state, connection, clientMsg);
    case 'ping':
      return pingMessage(clientMsg, connection);
  }
};

const authMessage = (
  state: State,
  connection: InitialConnection,
  clientMsg: ClientMsg['auth'],
): Cmd => {
  const { token } = clientMsg;

  const dbConnect = connectionDB();
  selectUserByToken(dbConnect, token).then((result: any) => {
    dbConnect.end();

    if (!result) {
      return;
    }

    state.connections.map.set(connection.id, {
      status: 'user',
      id: connection.id,
      socket: connection.socket,
      name: result.name,
    });
  });
};

const botAuthMessage = (
  state: State,
  connection: InitialConnection,
  clientMsg: ClientMsg['botAuth'],
): Cmd => {
  state.connections.map.set(connection.id, {
    status: 'user',
    id: connection.id,
    socket: connection.socket,
    name: clientMsg.name,
  });
};

const playerStart = (
  state: State,
  connection: UserConnection,
  clientMsg: ClientMsg['joinGame'],
): Cmd => {
  const { gameId } = clientMsg;

  const gameState = state.games.map.get(gameId);
  if (!gameState) {
    return cmd.sendMsg(connection.id, msg.gameJoinFail());
  }

  // TODO: добавить проверку на возможность добавить пользователя в игру
  // Что-нибудь вроде game.canJoinPlayer

  state.connections.map.set(connection.id, {
    status: 'player',
    id: connection.id,
    socket: connection.socket,
    name: connection.name,
    gameId: gameState.id,
  });

  return game.joinPlayer(gameState, connection.id, connection.name);
};

const observerStart = (
  state: State,
  connection: UserConnection,
  clientMsg: ClientMsg['joinGameAsObserver'],
): Cmd => {
  const { gameId } = clientMsg;

  const gameState = state.games.map.get(gameId);
  if (!gameState) {
    return cmd.sendMsg(connection.id, msg.gameJoinFail());
  }

  state.connections.map.set(connection.id, {
    status: 'observer',
    id: connection.id,
    socket: connection.socket,
    name: connection.name,
    gameId: gameState.id,
  });

  return game.joinObserver(gameState, connection.id, connection.name);
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
    case 'restart':
      return restartMessage(state, connection.id);
  }
};

const restartMessage = (state: State, connectionId: number): Cmd => {
  const connection = state.connections.map.get(connectionId);
  if (!connection || connection.status !== 'player') {
    return;
  }

  const playerGame = state.games.map.get(connection.gameId);
  if (!playerGame) {
    return;
  }

  return game.playerRestart(playerGame, connectionId);
};

export const observerConnectionMessage = (
  _state: State,
  connection: ObserverConnection,
  clientMsg: AnyClientMsg,
): Cmd => {
  switch (clientMsg.type) {
    case 'ping':
      return pingMessage(clientMsg, connection);
  }
};

export const pingMessage = (clientMsg: ClientMsg['ping'], connection: Connection): Cmd => {
  // Да, функция — не чистая, но и пофиг!
  return cmd.sendMsg(connection.id, msg.pong(time(), clientMsg.time));
};

export const connectionLost = (state: State, connectionId: number): Cmd => {
  const connection = state.connections.map.get(connectionId);
  if (!connection) {
    return;
  }
  state.connections.map.delete(connectionId);

  switch (connection.status) {
    case 'player': {
      const gameState = state.games.map.get(connection.gameId);
      if (gameState) {
        return game.kickPlayer(gameState, connection.id);
      }
    }
    case 'observer': {
      const gameState = state.games.map.get(connection.gameId);
      if (gameState) {
        return game.kickObserver(gameState, connection.id);
      }
    }
  }
};

const updatePlayerChanges = (
  state: State,
  msg: ClientMsg['changes'],
  connectionId: number,
): Cmd => {
  const connection = state.connections.map.get(connectionId);
  if (!connection || connection.status !== 'player') {
    return;
  }

  const gameState = state.games.map.get(connection.gameId);
  if (gameState) {
    return game.updatePlayerChanges(gameState, connectionId, msg);
  }
};

export const tick = (state: State, time: number): Cmd => {
  const cmds = mapMap(state.games.map, (gameState) => {
    return game.tick(gameState, time);
  });

  return union(cmds);
};

export const createGame = (state: State, time: number): Cmd => {
  const gameState = game.createGameState(state.games.nextId, time);
  state.games.nextId++;
  state.games.map.set(gameState.id, gameState);
};

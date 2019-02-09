import '@2gis/gl-matrix';

import * as express from 'express';
import * as ws from 'ws';
import { Msg } from '../types/clientMsg';
import { ServerMsg } from '../types/serverMsg';
import { createNewConnection, message, connectionLost } from './reducers';
import {
  getConnectionByPlayerId,
  getStartDataMsg,
  getPlayerLeaveMsg,
  getTickDataMsg,
} from './selectors';
import { Connection, State } from './types';
import { tick } from './reducers/step';
import { ExistCmd } from './commands';
import { createState } from './state';

const port = 3001;

const app = express();

const server = app.listen(port, () => console.log(`Server listen on ${port} port`));

const wsServer = new ws.Server({
  server,
});

const state = createState(Date.now());

const gameStep = 30;

const sendMessage = (connection: Connection, msg: ServerMsg): void => {
  connection.socket.send(JSON.stringify(msg));
};

const sendAllPlayersMessage = (state: State, msg: ServerMsg): void => {
  state.players.map.forEach((player) => {
    const connection = getConnectionByPlayerId(state, player.id);
    if (connection) {
      sendMessage(connection, msg);
    }
  });
};

const executeCmd = (cmd: ExistCmd) => {
  switch (cmd.type) {
    case 'sendStartData': {
      const msg = getStartDataMsg(state, cmd.playerId);
      const connection = getConnectionByPlayerId(state, cmd.playerId);
      if (connection && msg) {
        sendMessage(connection, msg);
      }
      break;
    }
    case 'sendPlayerLeave': {
      const msg = getPlayerLeaveMsg(cmd.playerId);
      sendAllPlayersMessage(state, msg);
      break;
    }
    case 'sendPlayersTickData': {
      const msg = getTickDataMsg(state);
      sendAllPlayersMessage(state, msg);
      break;
    }
  }
};

const gameLoop = () => {
  setTimeout(gameLoop, gameStep);
  const cmd = tick(state, Date.now());
  if (cmd) {
    executeCmd(cmd);
  }
};
gameLoop();

wsServer.on('connection', (socket) => {
  const id = createNewConnection(state.connections, socket);

  const onMessage = (data: string) => {
    let msg: Msg;

    try {
      msg = JSON.parse(data);
    } catch (e) {
      return;
    }

    const cmd = message(state, id, msg);
    if (cmd) {
      executeCmd(cmd);
    }
  };

  socket.on('message', onMessage);

  const onClose = () => {
    const cmd = connectionLost(state, id);
    if (cmd) {
      executeCmd(cmd);
    }
    socket.off('message', onMessage);
    socket.off('close', onClose);
  };

  socket.on('close', onClose);
});

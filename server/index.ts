import '@2gis/gl-matrix';

import * as express from 'express';
import * as path from 'path';
import * as ws from 'ws';
import { createNewConnection, message, connectionLost } from './reducers';
import { Connection, State } from './types';
import { tick } from './reducers/tick';
import { ExistCmd, Cmd } from './commands';
import { createState } from './state';
import { getConnectionByPlayerId } from './utils';
import { AnyServerMsg } from './messages';
import { AnyClientMsg } from '../client/messages';

const port = 3002;

const app = express();

app.use(express.static(path.join(__dirname, '../dist')));

const server = app.listen(port, () => console.log(`Server listen on ${port} port`));

const wsServer = new ws.Server({
  server,
});

const state = createState(Date.now());

app.get('/state', (_req, res) => {
  const data = {
    bodies: Array.from(state.bodies.map),
    players: Array.from(state.players.map),
    connections: Array.from(state.connections.map).map((v) => {
      const { id, status } = v[1];
      return {
        id,
        status,
      };
    }),
  };
  res.send(JSON.stringify(data, null, 2));
});

const gameStep = 50;

const sendMessage = (connection: Connection, msg: AnyServerMsg): void => {
  try {
    connection.socket.send(JSON.stringify(msg));
  } catch (e) {
    console.error(e);
  }
};

const sendAllPlayersMessage = (state: State, msg: AnyServerMsg): void => {
  state.players.map.forEach((player) => {
    const connection = getConnectionByPlayerId(state, player.id);
    if (connection) {
      sendMessage(connection, msg);
    }
  });
};

const executeCmd = (cmd: Cmd) => {
  if (cmd) {
    if (Array.isArray(cmd)) {
      cmd.forEach(executeOneCmd);
    } else {
      executeOneCmd(cmd);
    }
  }
};

const executeOneCmd = (cmd: ExistCmd) => {
  switch (cmd.type) {
    case 'sendMsg': {
      const connection = state.connections.map.get(cmd.connectionId);
      if (connection) {
        sendMessage(connection, cmd.msg);
      }
      break;
    }

    case 'sendMsgToAll': {
      sendAllPlayersMessage(state, cmd.msg);
      break;
    }
  }
};

const gameLoop = () => {
  setTimeout(gameLoop, gameStep);
  const cmd = tick(state, Date.now());
  executeCmd(cmd);
};
gameLoop();

wsServer.on('connection', (socket) => {
  const id = createNewConnection(state.connections, socket);

  const onMessage = (data: string) => {
    let msg: AnyClientMsg;

    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error(`Bad client message ${data}`);
      return;
    }

    const cmd = message(state, id, msg);
    executeCmd(cmd);
  };

  socket.on('message', onMessage);

  const onClose = () => {
    const cmd = connectionLost(state, id);
    executeCmd(cmd);
    // socket.off('message', onMessage);
    // socket.off('close', onClose);
  };

  socket.on('close', onClose);
});

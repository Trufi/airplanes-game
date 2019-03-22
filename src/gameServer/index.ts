import '@2gis/gl-matrix';
import * as express from 'express';
import * as ws from 'ws';
import {
  createNewConnection,
  message,
  connectionLost,
  tick,
  createGame,
  authConnection,
} from './reducers';
import { Connection } from './types';
import { ExistCmd, Cmd, cmd } from './commands';
import { createState } from './state';
import { AnyServerMsg, msg } from './messages';
import { time } from './utils';
import { unpackMessage } from './messages/unpack';
import * as config from '../config';
import * as api from './services/main';
import { mapMap } from '../utils';

const port = 3001;

const app = express();

// health check для k8s
app.get('/', (_req, res) => res.sendStatus(200));

const server = app.listen(port, () => console.log(`Game server listen on ${port} port`));

const wsServer = new ws.Server({
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
  },
});

const state = createState({
  maxPlayers: 30,
  city: 'nsk',
  type: 'dm',
  url: process.env.GAME_SERVER_URL || `localhost:${port}`,
});
createGame(state, time());

console.log(
  `Start game server with url: ${state.url}, type: ${state.type}, city: ${
    state.city
  }, maxPlayers: ${state.maxPlayers}, main server url: ${config.mainServer.url}`,
);

app.get('/state', (_req, res) => {
  const result = {
    city: state.city,
    type: state.type,
    maxPlayers: state.maxPlayers,
    url: state.url,
    connections: mapMap(state.connections.map, (c) => c),
    games: mapMap(state.games.map, (c) => c),
  };
  res.send(JSON.stringify(result));
});

const sendMessage = (connection: Connection, msg: AnyServerMsg): void => {
  try {
    connection.socket.send(JSON.stringify(msg));
  } catch (e) {
    console.error(e);
  }
};

const sendPbfMessage = (connection: Connection, msg: ArrayBuffer): void => {
  try {
    connection.socket.send(msg);
  } catch (e) {
    console.error(e);
  }
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

const executeOneCmd = (cmdData: ExistCmd) => {
  switch (cmdData.type) {
    case 'sendMsg': {
      const connection = state.connections.map.get(cmdData.connectionId);
      if (connection) {
        sendMessage(connection, cmdData.msg);
      }
      break;
    }

    case 'sendMsgTo': {
      cmdData.connectionIds.forEach((id) => {
        const connection = state.connections.map.get(id);
        if (connection) {
          sendMessage(connection, cmdData.msg);
        }
      });
      break;
    }

    case 'sendPbfMsgTo': {
      cmdData.connectionIds.forEach((id) => {
        const connection = state.connections.map.get(id);
        if (connection) {
          sendPbfMessage(connection, cmdData.msg);
        }
      });
      break;
    }

    case 'authPlayer': {
      api
        .player({
          gameUrl: state.url,
          playerToken: cmdData.token,
        })
        .then((res) => {
          const cmd = authConnection(
            state,
            cmdData.connectionId,
            res.id,
            res.name,
            cmdData.joinType,
          );
          executeCmd(cmd);
        })
        .catch((err) => {
          console.log(`Auth player main server request error: ${err}`);
        });
      break;
    }
  }
};

const gameLoop = () => {
  setTimeout(gameLoop, config.serverGameStep);
  const cmd = tick(state, time());
  executeCmd(cmd);
};
gameLoop();

const notifyMainServer = () => {
  const game = state.games.map.get(1);
  if (!game) {
    return;
  }

  const { url, type, city, maxPlayers } = state;

  console.log(`Notify main server about me with url: ${url}`);
  api
    .notify({
      url,
      type,
      city,
      players: game.players.size,
      maxPlayers,
    })
    .catch((err) => {
      console.log(`Main server notify error: ${err}`);
    });
};

setInterval(() => notifyMainServer(), config.gameServer.updateMainInverval);
notifyMainServer();

wsServer.on('connection', (socket) => {
  const id = createNewConnection(state.connections, socket);

  const onMessage = (data: ws.Data) => {
    const msg = unpackMessage(data);
    if (!msg) {
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

  executeCmd(cmd.sendMsg(id, msg.connect(id)));
});

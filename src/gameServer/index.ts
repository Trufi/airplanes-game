import '@2gis/gl-matrix';
import * as express from 'express';
import * as ws from 'ws';
import { createNewConnection, message, connectionLost, tick, authConnection } from './reducers';
import { Connection } from './types';
import { ExistCmd, Cmd, cmd } from './commands';
import { createState } from './state';
import { AnyServerMsg, msg } from './messages';
import { time } from './utils';
import { unpackMessage } from './messages/unpack';
import * as config from '../config';
import * as api from './services/main';
import { mapMap } from '../utils';
import * as game from './games/game';

const port = 3001;

const app = express();

// health check для k8s
app.get('/', (_req, res) => res.sendStatus(200));

// Metrics
app.get('/metrics', (_, res) => {
  res.send(`
    <pre style="word-wrap: break-word; white-space: pre-wrap;">
# HELP sky_game_active_players Active players in game
# TYPE sky_game_active_players gauge
sky_game_active_players ${state.game.players.size}</pre>
    `);
});

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

let url = config.gameServer.url;

// Если случайно передали протокол, то убираем его
url = url.replace('http://', '');
url = url.replace('https://', '');

const state = createState(
  {
    maxPlayers: 30,
    city: 'nsk',
    type: 'dm',
    url,
    duration: Number.MAX_SAFE_INTEGER,
  },
  time(),
);

console.log(
  `Start game server with url: ${state.url}, type: ${state.type}, city: ${
    state.city
  }, maxPlayers: ${state.game.maxPlayers}, main server url: ${config.mainServer.url}`,
);

app.get('/state', (_req, res) => {
  const result = {
    city: state.city,
    type: state.type,
    url: state.url,
    connections: mapMap(state.connections.map, ({ id, status }) => ({ id, status })),
    game: game.debugInfo(state.game),
  };
  res.send(JSON.stringify(result));
});

app.get('/restart/:sec', (req, res) => {
  const secret = req.query.secret;
  if (secret === 'fdsa') {
    const seconds = Number(req.params.sec);
    if (seconds && seconds > 0) {
      console.log(`Restart game after ${seconds} seconds`);
      executeCmd(game.restartInSeconds(state.game, seconds));
      return res.sendStatus(200);
    }
  }

  res.sendStatus(404);
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
  const {
    url,
    type,
    city,
    game: { maxPlayers, players },
  } = state;

  api
    .notify({
      url,
      type,
      city,
      players: players.size,
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

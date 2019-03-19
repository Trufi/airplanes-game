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

const port = 3001;

const app = express();

const server = app.listen(port, () => console.log(`Server listen on ${port} port`));

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

const url = `localhost:${port}`;
const name = 'Super death match';

api.register({ url, name }).then((res) => {
  if (!res) {
    return;
  }
  const { token } = res;

  const state = createState(token);
  createGame(state, time());

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
            token: state.token,
            playerToken: cmdData.token,
          })
          .then((res) => {
            if (!res) {
              return;
            }
            const cmd = authConnection(
              state,
              cmdData.connectionId,
              res.id,
              res.name,
              cmdData.gameId,
              cmdData.joinType,
            );
            executeCmd(cmd);
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
});

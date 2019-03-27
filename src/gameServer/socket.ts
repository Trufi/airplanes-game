import { Server } from 'http';
import * as ws from 'ws';
import { createNewConnection, message, connectionLost, authConnection } from './reducers';
import { Connection, State } from './types';
import { ExistCmd, Cmd, cmd } from './commands';
import { AnyServerMsg, msg } from './messages';
import { unpackMessage } from './messages/unpack';
import * as api from './services/main';

export const initSocket = (server: Server, state: State) => {
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

      case 'sendMsgToAllInGame': {
        state.connections.map.forEach((connection) => {
          if (connection.status === 'player' || connection.status === 'observer') {
            sendMessage(connection, cmdData.msg);
          }
        });
        break;
      }

      case 'authPlayer': {
        api
          .player({
            gameUrl: state.url,
            playerToken: cmdData.token,
            toFinal: state.isGrandFinal,
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

  wsServer.on('connection', (socket) => {
    const id = createNewConnection(state.connections, socket);

    const onMessage = (data: ws.Data) => {
      const msg = unpackMessage(data, id);
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

  return { executeCmd };
};

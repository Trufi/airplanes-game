import '@2gis/gl-matrix';
import * as express from 'express';
import * as path from 'path';
import * as ws from 'ws';
import { createNewConnection, message, connectionLost, tick, createGame } from './reducers';
import { Connection } from './types';
import { ExistCmd, Cmd, cmd } from './commands';
import { createState } from './state';
import { AnyServerMsg, msg } from './messages';
import { AnyClientMsg } from '../client/messages';
import { time } from './utils';
import { applyRouter } from './routes';
import { applyMiddlewares } from './middlewares';

const port = 3002;

const app = express();

const server = app.listen(port, () => console.log(`Server listen on ${port} port`));

const wsServer = new ws.Server({
  server,
});

const state = createState();
createGame(state, time());

applyMiddlewares(app);
applyRouter(app, state);

// Всю статику заставляем кэшироваться
app.use(
  express.static(path.join(__dirname, '../../dist'), {
    maxAge: 86400000, // сутки
    index: false,
  }),
);
// А index.html — нет
app.use(express.static(path.join(__dirname, '../../dist')));

const gameStep = 50;

const sendMessage = (connection: Connection, msg: AnyServerMsg): void => {
  try {
    connection.socket.send(JSON.stringify(msg));
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

  executeCmd(cmd.sendMsg(id, msg.connect(id)));
});

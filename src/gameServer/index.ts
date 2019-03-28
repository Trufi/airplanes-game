import '@2gis/gl-matrix';
import * as express from 'express';
import { json } from 'body-parser';
import { tick } from './reducers';
import { createState } from './state';
import { time } from './utils';
import * as config from '../config';
import * as api from './services/main';
import { City, GameType } from '../types';
import { applyRoutes } from './routes';
import { initSocket } from './socket';
import { cmd } from './commands';

const port = 3001;

const app = express();

app.use(json());

const server = app.listen(port, () => console.log(`Game server listen on ${port} port`));

let url = config.gameServer.url;
// Если случайно передали протокол, то убираем его
url = url.replace('http://', '');
url = url.replace('https://', '');

// Ищем Id бесконечной игры
api
  .getTournamentList()
  .then(({ tournaments }) => {
    const tournament = tournaments.find((t) => t.machine_name === 'infinity');
    const tournamentId = tournament ? tournament.id : -1;
    init(tournamentId);
  })
  .catch((err) => {
    console.log(`Get tournament list error: ${err}`);
    init(-1);
  });

const init = (tournamentId: number) => {
  const type = config.gameServer.type as GameType;

  // Если турнир, то он по умолчанию выключен
  // Если DM, то 4 суток
  const duration = type === 'tournament' ? 0 : 345600000;

  const state = createState(
    {
      maxPlayers: 30,
      city: config.gameServer.city as City,
      type,
      duration,
      url,
    },
    time(),
    tournamentId,
  );

  console.log(
    `Start game server with url: ${state.url}, type: ${state.type}, city: ${state.game.city}, ` +
      `maxPlayers: ${state.game.maxPlayers}, main server url: ${config.mainServer.url}, ` +
      `tournamentId: ${tournamentId}`,
  );

  const { executeCmd } = initSocket(server, state);
  applyRoutes(app, state, executeCmd);

  const gameLoop = () => {
    setTimeout(gameLoop, config.serverGameStep);
    const cmd = tick(state, time());
    executeCmd(cmd);
  };
  gameLoop();

  setInterval(() => executeCmd(cmd.notifyMain()), config.gameServer.updateMainInverval);
  executeCmd(cmd.notifyMain());

  const noop = () => {};
  setInterval(() => {
    state.connections.map.forEach((connection) => {
      if (!connection.isAlive) {
        connection.socket.terminate();
      } else {
        connection.isAlive = false;
        connection.socket.ping(noop);
      }
    });
  }, config.gameServer.clientsCheckInterval);
};

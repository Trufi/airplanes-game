import '@2gis/gl-matrix';
import * as express from 'express';
import { json } from 'body-parser';
import { tick } from './reducers';
import { createState } from './state';
import { time } from './utils';
import * as config from '../config';
import * as api from './services/main';
import { City } from '../types';
import { applyRoutes } from './routes';
import { initSocket } from './socket';

const port = 3001;

const app = express();

app.use(json());

const server = app.listen(port, () => console.log(`Game server listen on ${port} port`));

let url = config.gameServer.url;
// Если случайно передали протокол, то убираем его
url = url.replace('http://', '');
url = url.replace('https://', '');

// Ищем Id бесконечной игры
api.getTournamentList().then(({ tournaments }) => {
  const tournament = tournaments.find((t) => t.machine_name === 'infinity');
  const tournamentId = tournament ? tournament.id : -1;
  init(tournamentId);
});

const init = (tournamentId: number) => {
  const state = createState(
    {
      maxPlayers: 30,
      city: config.gameServer.city as City,
      type: 'dm',
      url,
      duration: 345600000, // 4 суток
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

  const notifyMainServer = () => {
    const {
      url,
      type,
      game: { maxPlayers, players, tournamentId, city },
    } = state;

    api
      .notify({
        url,
        type,
        city,
        players: players.size,
        maxPlayers,
        tournamentId,
      })
      .catch((err) => {
        console.log(`Main server notify error: ${err}`);
      });
  };

  setInterval(() => notifyMainServer(), config.gameServer.updateMainInverval);
  notifyMainServer();
};

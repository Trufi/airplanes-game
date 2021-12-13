import '@2gis/gl-matrix';
import * as express from 'express';
import * as path from 'path';
import * as config from '../config';
import { applyRouter } from './routes';
import { applyMiddlewares } from './middlewares';
import { State } from './types';
import { clearOldGames } from './reducers';

const port = process.env.MAIN_SERVER_PORT || 3002;

const app = express();

app.listen(port, () => console.log(`Main server listen on ${port} port`));

const state: State = {
  games: {
    nextId: 1,
    map: new Map(),
    byUrl: new Map(),
  },
};

applyMiddlewares(app);
applyRouter(app, state);

// Всю статику заставляем кэшироваться
app.use(
  express.static(path.join(process.cwd(), 'dist', 'client'), {
    maxAge: 86400000, // сутки
    index: false,
  }),
);
// А index.html — нет
app.use(express.static(path.join(process.cwd(), 'dist', 'client')));

// Удаляем старые игры
setInterval(() => clearOldGames(state), config.mainServer.clearGameThreshold);

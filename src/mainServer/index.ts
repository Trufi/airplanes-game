import '@2gis/gl-matrix';
import * as express from 'express';
import * as path from 'path';
import { applyRouter } from './routes';
import { applyMiddlewares } from './middlewares';
import { State } from './types';

const port = 3002;

const app = express();

app.listen(port, () => console.log(`Server listen on ${port} port`));

const state: State = {
  games: {
    nextId: 1,
    map: new Map(),
    byToken: new Map(),
  },
};

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

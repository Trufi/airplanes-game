import * as express from 'express';
import { State } from '../types';
import { addGame, updateGame } from '../reducers';
import { connectionDB } from '../models/database';
import { selectUserByToken } from '../models/user';
import { createHmac } from 'crypto';
import {
  RegisterResponse,
  PlayerResponse,
  RegisterRequest,
  PlayerRequest,
  UpdateRequest,
} from '../types/gameApi';

const createGameServerToken = (p: { name: string; url: string }) => {
  return createHmac('sha256', `${p.name}${p.url}`).digest('hex');
};

export const applyGameServerRouter = (app: express.Express, state: State) => {
  const router = express.Router();

  /**
   * Регистрация нового игрового сервера
   */
  router.post('/register', (req, res) => {
    const { name, url } = req.body as RegisterRequest;
    const token = createGameServerToken({ name, url });
    const id = addGame(state, { name, url, token });
    console.log(`Create new game with id: ${id}, name: ${name}, url: ${url}`);
    const result: RegisterResponse = { token };
    res.send(result);
  });

  router.post('/update', (req, res) => {
    const { token, players } = req.body as UpdateRequest;
    const error = updateGame(state, { token, players });
    if (error) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  });

  router.post('/player', (req, res) => {
    const { token, playerToken } = req.body as PlayerRequest;

    if (!state.games.byToken.has(token)) {
      res.sendStatus(400);
      return;
    }

    const dbConnect = connectionDB();
    selectUserByToken(dbConnect, playerToken)
      .then((result: any) => {
        dbConnect.end();

        if (!result) {
          res.sendStatus(404);
          return;
        }

        const { id, name } = result;

        const data: PlayerResponse = {
          id,
          name,
        };

        res.send(data);
      })
      .catch(() => dbConnect.end());
  });

  app.use('/game', router);
};

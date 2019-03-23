import * as express from 'express';
import { State } from '../types';
import { updateGameData } from '../reducers';
import { connectionDB } from '../models/database';
import { selectUserByToken } from '../models/user';
import { NotifyRequest, PlayerResponse, PlayerRequest } from '../types/gameApi';

export const applyGameServerRouter = (app: express.Express, state: State) => {
  const router = express.Router();

  /**
   * Регистрация нового игрового сервера
   */
  router.post('/notify', (req, res) => {
    const body = req.body as NotifyRequest;
    updateGameData(state, body);
    res.sendStatus(200);
  });

  router.post('/player', (req, res) => {
    const { gameUrl, playerToken } = req.body as PlayerRequest;

    if (!state.games.byUrl.has(gameUrl)) {
      res.sendStatus(400);
      return;
    }

    const dbConnect = connectionDB();
    selectUserByToken(dbConnect, playerToken)
      .then((result: any) => {
        return dbConnect.end().then(() => {
          console.log('selectUserByToken:result', result);
          if (!result) {
            console.log('selectUserByToken:err', 404);
            res.sendStatus(404);
            return;
          }

          const { id, name } = result;

          const data: PlayerResponse = {
            id,
            name,
          };

          res.send(data);
        });
      })
      .catch(() => {
        return dbConnect.end().then(() => {
          console.log('selectUserByToken:err', 500);
          res.sendStatus(500);
        });
      });
  });

  app.use('/game', router);
};

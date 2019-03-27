import * as express from 'express';
import { State } from '../types';
import { updateGameData } from '../reducers';
import { connectionDB } from '../models/database';
import { selectUserByToken } from '../models/user';
import { NotifyRequest, PlayerResponse, PlayerRequest } from '../types/gameApi';
import { getPretenders } from '../models/tournaments';

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

  router.post('/player', async (req, res) => {
    const { playerToken, toFinal } = req.body as PlayerRequest;

    const dbConnect = connectionDB();

    try {
      const user = await selectUserByToken(dbConnect, playerToken);
      if (!user) {
        console.log(`Game server router /player with token: ${playerToken} not found`);
        res.sendStatus(404);
      } else {
        const { id, name } = user;
        const data: PlayerResponse = {
          id,
          name,
        };

        if (toFinal) {
          const pretenders = await getPretenders(dbConnect);
          const canJoinFinal = pretenders.find((p) => p.user_id === id);
          if (canJoinFinal) {
            res.send(data);
          } else {
            res.sendStatus(404);
          }
        } else {
          res.send(data);
        }
      }
    } catch (err) {
      console.log(`Game server router /player error: ${err}`);
      res.sendStatus(500);
    }

    await dbConnect.end();
  });

  app.use('/game', router);
};

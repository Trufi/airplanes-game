import * as express from 'express';
import { State } from '../types';
import { updateGameData } from '../reducers';
import { connectionDB } from '../models/database';
import {
  selectUserByToken,
  getUserStatsByTournament,
  updateUserStats,
  attachUserToTournament,
} from '../models/database/mock';
import {
  NotifyRequest,
  PlayerResponse,
  PlayerRequest,
  AddPlayerStatsRequest,
} from '../types/gameApi';
import { getPretenders, getFullTournamentList } from '../models/database/mock';
import { UserStats, Tournament } from '../models/types';
import { TournamentListResponse } from '../types/api';

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
    const { playerToken, toFinal, tournamentId } = req.body as PlayerRequest;

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
          kills: 0,
          deaths: 0,
          points: 0,
        };

        const stats = await getUserStatsByTournament(dbConnect, id, tournamentId);
        if (stats) {
          data.kills = stats.kills;
          data.deaths = stats.deaths;
          data.points = stats.points;
        }

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

  router.post('/player/:id/stats', (req, res) => {
    const data = req.body as AddPlayerStatsRequest;
    const { deaths = 0, kills = 0, points = 0, tournamentId } = data;
    const playerId = Number(req.params.id);

    const connection = connectionDB();

    getUserStatsByTournament(connection, playerId, tournamentId)
      .then((stats: UserStats | undefined) => {
        if (stats) {
          return updateUserStats(connection, playerId, tournamentId, {
            kills: stats.kills + kills,
            deaths: stats.deaths + deaths,
            points: stats.points + points,
          });
        }
        return attachUserToTournament(connection, playerId, tournamentId, {
          kills,
          deaths,
          points,
        });
      })
      .then(() => {
        console.log('Game Server:SetStats', data, playerId, tournamentId);
        connection.end().then(() => {
          res.sendStatus(200);
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('/user/stats:err', err);
          res.sendStatus(501);
        });
      });
  });

  router.get('/tournament/list', (_req, res) => {
    const connection = connectionDB();
    getFullTournamentList(connection)
      .then((tournaments: Tournament[]) => {
        connection.end().then(() => {
          const result: TournamentListResponse = { tournaments };
          res.send(result);
        });
      })
      .catch((err: any) => {
        connection.end().then(() => {
          console.log('Game server /tournament/list:err', err);
          res.sendStatus(501);
        });
      });
  });

  app.use('/game', router);
};

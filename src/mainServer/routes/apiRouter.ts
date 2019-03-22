import { serializeUser, deserializeUser, authenticate, use as usePassport } from 'passport';
import { Router, Express } from 'express';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { connectionDB } from '../models/database';
import {
  createToken,
  createUser,
  selectUser,
  selectUserByName,
  selectUserByToken,
  updateUserStats,
} from '../models/user';
import { getAchievements, getOwnAchievements, setAchievements } from '../models/achievements';
import { State } from '../types';
import { setAccessAllowOrigin } from './cors';
import { mapMap } from '../../utils';
import { GamelistResponse } from '../types/api';

export function applyApiRouter(app: Express, state: State) {
  const apiRouter = Router();
  const ERROR_CODE = 501;

  serializeUser((user, done) => done(null, user));
  deserializeUser((user, done) => done(null, user));

  const strategy = new BearerStrategy((token: string, done: any) => {
    const connection = connectionDB();
    const promise = selectUserByToken(connection, token);

    promise
      .then((result: any) => {
        console.log('result', result);
        connection.end();
        if (!result) {
          return done(null, false);
        }

        return done(
          null,
          {
            id: result.id,
            name: result.name,
            kills: 0,
            deaths: result.deaths,
            points: result.points,
            token,
          },
          { scope: 'all' },
        );
      })
      .catch((err) => {
        connection.end();
        console.log('err', err);
        return done(null, false);
      });
  });

  /**
   * Preflight block.
   */
  apiRouter.options(
    [
      '/register',
      '/auth',
      '/gamelist',
      '/login',
      '/user/stats',
      '/achievement/own',
      '/achievement/set',
      '/achievement/list',
    ],
    (req, res) => {
      setAccessAllowOrigin(req, res);
      res.sendStatus(200);
    },
  );

  apiRouter.post('/register', (req, res) => {
    setAccessAllowOrigin(req, res);

    if (!req.body.username) {
      return res.status(422).send('Unprocessed entity');
    }
    if (!req.body.password) {
      return res.status(422).send('Unprocessed entity');
    }

    const username = req.body.username;
    const token = createToken({ name: req.body.username, password: req.body.password });

    const connection = connectionDB();
    selectUserByName(connection, username)
      .then((result: any) => {
        if (result) {
          res.status(400).send('Username already exists');
          return;
        }
        createUser(connection, {
          name: req.body.username,
          password: token,
        })
          .then(() => {
            connection.end();
            res.status(200).send({
              user: {
                name: req.body.username,
                token,
              },
            });
          })
          .catch((err) => {
            console.log('createUser err', err);
            connection.end();
            res.sendStatus(ERROR_CODE);
          });
      })
      .catch((err) => {
        console.log('err', err);
        connection.end();
        res.sendStatus(ERROR_CODE);
      });
  });

  apiRouter.post('/login', (req, res) => {
    setAccessAllowOrigin(req, res);

    if (!req.body.username) {
      return res.status(422).send('Unprocessed entity');
    }
    if (!req.body.password) {
      return res.status(422).send('Unprocessed entity');
    }

    const token = createToken({ name: req.body.username, password: req.body.password });

    const connection = connectionDB();
    const promise = selectUserByToken(connection, token);

    promise
      .then((result: any) => {
        console.log('result', result);
        connection.end();
        if (!result) {
          res.sendStatus(401);
        }

        res.send({
          user: {
            id: result.id,
            name: result.name,
            kills: 0,
            deaths: 0,
            points: 0,
            token,
          },
        });
      })
      .catch((err) => {
        console.log('err', err);
        connection.end();
        res.sendStatus(ERROR_CODE);
      });
  });

  apiRouter.post('/auth', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    const { id } = req.user;
    const promise = selectUser(connection, id);

    promise
      .then((result: any) => {
        connection.end();
        res.send({
          user: {
            deaths: result.deaths,
            id: result.id,
            kills: 0,
            name: 0,
            token: 0,
            points: 0,
          },
        });
      })
      .catch((err) => {
        connection.end();
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
  });

  apiRouter.post('/user/stats', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const { deaths, kills, points } = req.body;

    if (typeof deaths === 'undefined' || typeof deaths !== 'number') {
      return res.status(422).send('Unprocessed entity: deaths');
    }
    if (typeof kills === 'undefined' || typeof kills !== 'number') {
      return res.status(422).send('Unprocessed entity: kills');
    }
    if (typeof points === 'undefined' || typeof points !== 'number') {
      return res.status(422).send('Unprocessed entity: points');
    }

    const connection = connectionDB();
    const { id } = req.user;
    const tournamentId = req.body.tournamentId;

    updateUserStats(connection, id, tournamentId, {
      kills: req.user.kills + kills,
      deaths: req.user.deaths + deaths,
      points: req.user.points + points,
    })
      .then(() => {
        connection.end();
        res.sendStatus(200);
      })
      .catch((err) => {
        connection.end();
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
  });

  apiRouter.get(
    '/achievement/own',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);

      const connection = connectionDB();
      const promise = getOwnAchievements(connection, req.user.id);

      promise
        .then((result) => {
          connection.end();
          res.send({ achievements: result });
        })
        .catch((err) => {
          connection.end();
          console.log('err', err);
          res.sendStatus(ERROR_CODE);
        });
    },
  );

  apiRouter.get('/achievement/list', (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    const promise = getAchievements(connection);

    promise
      .then((result) => {
        connection.end();
        res.send({ achievements: result });
      })
      .catch((err) => {
        connection.end();
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
  });

  apiRouter.post(
    '/achievement/set',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);

      const { achievementId } = req.body;
      const { id } = req.user;

      if (!id || typeof id !== 'number') {
        return res.status(422).send('Unprocessed entity');
      }
      if (!achievementId || typeof achievementId !== 'number') {
        return res.status(422).send('Unprocessed entity');
      }
      const connection = connectionDB();
      const promise = setAchievements(connection, id, achievementId);
      promise
        .then((result) => {
          connection.end();
          res.send({ achievement: result });
        })
        .catch((err) => {
          connection.end();
          console.log('err', err);
          res.sendStatus(ERROR_CODE);
        });
    },
  );

  apiRouter.get('/gamelist', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const result: GamelistResponse = mapMap(state.games.map, ({ players, name, url }) => ({
      id: 1, // TODO: брать id от гейм сервера
      name,
      players,
      url,
    }));

    res.send(result);
  });

  usePassport(strategy);
  app.use('/api', apiRouter);
}

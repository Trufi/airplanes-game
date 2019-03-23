import { serializeUser, deserializeUser, authenticate, use as usePassport } from 'passport';
import { Router, Express } from 'express';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { connectionDB } from '../models/database';
import {
  attachUserToTournament,
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
import { getPretenders, getTournamentList } from '../models/tournaments';
import { Pretender, Tournament, User } from '../models/types';

export function applyApiRouter(app: Express, state: State) {
  const apiRouter = Router();
  const ERROR_CODE = 501;

  serializeUser((user, done) => done(null, user));
  deserializeUser((user, done) => done(null, user));

  const strategy = new BearerStrategy((token: string, done: any) => {
    const connection = connectionDB();

    selectUserByToken(connection, token)
      .then((result: any) => {
        connection.end().then(() => {
          console.log('BearerStrategy:result', result);
          if (!result) {
            return done(null, false);
          }

          return done(
            null,
            {
              id: result.id,
              name: result.name,
              token,
            },
            { scope: 'all' },
          );
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('BearerStrategy:err', err);
          return done(null, false);
        });
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
        return createUser(connection, {
          name: req.body.username,
          password: token,
        })
          .then(() => {
            connection.end().then(() => {
              res.status(200).send({
                user: {
                  name: req.body.username,
                  token,
                },
              });
            });
          })
          .catch((err) => {
            connection.end().then(() => {
              console.log('createUser:err', err);
              res.sendStatus(ERROR_CODE);
            });
          });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('createUser:err', err);
          res.sendStatus(ERROR_CODE);
        });
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
        console.log('/login:result', result);
        connection.end().then(() => {
          if (!result) {
            return res.sendStatus(401);
          }

          res.send({
            user: {
              id: result.id,
              name: result.name,
              token,
            },
          });
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('/login:err', err);
          return res.sendStatus(ERROR_CODE);
        });
      });
  });

  apiRouter.post('/auth', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    const { id } = req.user;

    selectUser(connection, id)
      .then((result: User) => {
        connection.end().then(() => {
          return res.send({
            user: {
              id: result.id,
              name: result.name,
              token: result.password,
            },
          });
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('/auth:err', err);
          res.sendStatus(ERROR_CODE);
        });
      });
  });

  apiRouter.post('/user/stats', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const { deaths, kills, points, tournamentId } = req.body;

    if (typeof tournamentId === 'undefined' || typeof tournamentId !== 'number') {
      return res.status(422).send('Unprocessed entity: tournamentId');
    }
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

    updateUserStats(connection, id, tournamentId, {
      kills: req.user.kills + kills,
      deaths: req.user.deaths + deaths,
      points: req.user.points + points,
    })
      .then(() => {
        connection.end().then(() => {
          res.sendStatus(200);
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('/user/stats:err', err);
          res.sendStatus(ERROR_CODE);
        });
      });
  });

  apiRouter.get('/tournament/list', (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    getTournamentList(connection)
      .then((result: Tournament[]) => {
        connection.end().then(() => {
          res.send({ tournaments: result });
        });
      })
      .catch((err: any) => {
        connection.end().then(() => {
          console.log('/tournament/list:err', err);
          res.sendStatus(ERROR_CODE);
        });
      });
  });

  apiRouter.post(
    '/tournament/attach',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);

      const { tournamentId } = req.body;

      if (typeof tournamentId === 'undefined' || typeof tournamentId !== 'number') {
        return res.status(422).send('Unprocessed entity: tournamentId');
      }

      const connection = connectionDB();
      const { id } = req.user;
      attachUserToTournament(connection, id, tournamentId)
        .then(() => {
          connection.end().then(() => {
            return res.status(200).send('OK');
          });
        })
        .catch((err) => {
          connection.end().then(() => {
            console.log('createUser:err', err);
            res.sendStatus(ERROR_CODE);
          });
        });
    },
  );

  apiRouter.get('/tournament/pretenders', (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    getPretenders(connection)
      .then((pretenders: Pretender[]) => {
        connection.end().then(() => {
          res.send({ pretenders });
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('/tournament/pretenders:err', err);
          res.sendStatus(ERROR_CODE);
        });
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
          connection.end().then(() => {
            res.send({ achievements: result });
          });
        })
        .catch((err) => {
          connection.end().then(() => {
            console.log('err', err);
            res.sendStatus(ERROR_CODE);
          });
        });
    },
  );

  apiRouter.get('/achievement/list', (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    const promise = getAchievements(connection);

    promise
      .then((result) => {
        connection.end().then(() => {
          res.send({ achievements: result });
        });
      })
      .catch((err) => {
        connection.end().then(() => {
          console.log('err', err);
          res.sendStatus(ERROR_CODE);
        });
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
          connection.end().then(() => {
            res.send({ achievement: result });
          });
        })
        .catch((err) => {
          connection.end().then(() => {
            console.log('err', err);
            res.sendStatus(ERROR_CODE);
          });
        });
    },
  );

  apiRouter.get('/gamelist', authenticate('bearer', { failureRedirect: '/' }), (req, res) => {
    setAccessAllowOrigin(req, res);

    const result: GamelistResponse = mapMap(
      state.games.map,
      ({ players, maxPlayers, type, url, city }) => ({
        players,
        maxPlayers,
        url,
        type,
        city,
      }),
    );

    res.send(result);
  });

  usePassport(strategy);
  app.use('/api', apiRouter);
}

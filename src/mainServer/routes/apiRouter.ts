import { serializeUser, deserializeUser, authenticate, use as usePassport } from 'passport';
import { Router, Express } from 'express';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { connectionDB } from '../models/database';
import {
  getUserStatsByTournament,
  createToken,
  createUser,
  selectUser,
  selectUserByName,
  selectUserByToken,
  getUserLadder,
} from '../models/user';
import { getAchievements, getOwnAchievements, setAchievements } from '../models/achievements';
import { State } from '../types';
import { setAccessAllowOrigin } from './cors';
import { mapMap } from '../../utils';
import { GamelistResponse, LadderResponse, TournamentListResponse } from '../types/api';
import { getPretenders, getTournamentList } from '../models/tournaments';
import { Pretender, Tournament, User, UserStats } from '../models/types';

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

  apiRouter.get(
    '/user/tournament/:id/stats',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);

      const tournamentId = Number(req.params.id);

      if (typeof tournamentId === 'undefined' || typeof tournamentId !== 'number') {
        return res.status(422).send('Unprocessed entity: tournamentId');
      }

      const connection = connectionDB();
      const { id } = req.user;
      getUserStatsByTournament(connection, id, tournamentId)
        .then((stats) => {
          connection.end().then(() => {
            return res.status(200).send({ stats });
          });
        })
        .catch((err) => {
          connection.end().then(() => {
            console.log('GET tournament/stats:err', err);
            res.sendStatus(ERROR_CODE);
          });
        });
    },
  );

  apiRouter.get(
    '/user/canIjoinToGrandFinal',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);
      const { id } = req.user;

      const connection = connectionDB();

      getPretenders(connection).then((pretenders: Pretender[]) => {
        connection.end().then(() => {
          const isApproved = pretenders.find((pretender) => pretender.user_id === id);
          if (isApproved) {
            return res.sendStatus(200);
          }
          return res.sendStatus(403);
        });
      });
    },
  );

  apiRouter.get(
    '/user/tournament/:id/ladder',
    authenticate('bearer', { failureRedirect: '/' }),
    (req, res) => {
      setAccessAllowOrigin(req, res);

      const connection = connectionDB();
      const userId = req.user.id;

      const tournamentId = Number(req.params.id);

      if (typeof tournamentId === 'undefined' || typeof tournamentId !== 'number') {
        return res.status(422).send('Unprocessed entity: tournamentId');
      }

      getUserLadder(connection, tournamentId)
        .then((ladder: UserStats[]) => {
          connection.end().then(() => {
            const myIndex = ladder.findIndex((stats) => stats.id === userId);

            if (myIndex === -1) {
              return res.status(403).send('Not Found');
            }

            if (myIndex === 0) {
              const result: LadderResponse = { ladder: [ladder[myIndex], ladder[myIndex + 1]] };
              return res.send(result);
            }
            if (myIndex === ladder.length - 1) {
              const result: LadderResponse = { ladder: [ladder[myIndex - 1], ladder[myIndex]] };
              return res.send(result);
            }

            const result: LadderResponse = {
              ladder: [ladder[myIndex - 1], ladder[myIndex], ladder[myIndex + 1]],
            };
            return res.send(result);
          });
        })
        .catch((err: any) => {
          connection.end().then(() => {
            console.log('/ladder:err', err);
            res.sendStatus(ERROR_CODE);
          });
        });
    },
  );

  apiRouter.get('/tournament/list', (req, res) => {
    setAccessAllowOrigin(req, res);

    const connection = connectionDB();
    getTournamentList(connection)
      .then((tournaments: Tournament[]) => {
        connection.end().then(() => {
          const result: TournamentListResponse = { tournaments };
          res.send(result);
        });
      })
      .catch((err: any) => {
        connection.end().then(() => {
          console.log('/tournament/list:err', err);
          res.sendStatus(ERROR_CODE);
        });
      });
  });

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
      ({ players, maxPlayers, url, city, isGrandFinal, type, enable }) => ({
        type,
        players,
        maxPlayers,
        url,
        isGrandFinal,
        city,
        enable,
      }),
    );

    res.send(result);
  });

  usePassport(strategy);
  app.use('/api', apiRouter);
}

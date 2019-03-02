import { Express } from 'express';
import * as passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { connectionDB } from '../models/database';
import { createUser, selectUser } from '../models/user';
import { getAchievements, getOwnAchievements, setAchievements } from '../models/achievements';

const ERROR_CODE = 501;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new BearerStrategy(
  (token: string, done: any) => {
    console.log('token', token);
    return done(
      null,
      {
        userId: 1,
        name: 'Ivan',
        token,
      },
      { scope: 'all' },
    );
  });

export function applyApiRouter(app: Express) {
  passport.use(strategy);

  app.post('/api/register', (req, res) => {
    console.log('req', req.body);
    if (!req.body.username) {
      return res.status(422).send('Unprocessed entity');
    }
    if (!req.body.password) {
      return res.status(422).send('Unprocessed entity');
    }
    if (!req.body.sessionId) {
      return res.status(422).send('Unprocessed entity');
    }
    const connection = connectionDB();
    const promise = createUser(connection, {
      name: req.body.username,
      password: req.body.password,
    });
    promise.then(() => {
      connection.end();
      res.send({ test: 'test', password: JSON.stringify(req.body) });
    }).catch((err) => {
      console.log('err', err);
      res.sendStatus(ERROR_CODE);
    });
  });

  app.post(
    '/api/login',
    passport.authenticate('bearer', { failureRedirect: '/login' }),
    (_, res) => {
      const connection = connectionDB();
      const promise = selectUser(connection, 1);

      promise.then((result) => {
        connection.end();
        console.log('result', result);
        res.send({ user: result });
      }).catch((err) => {
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
    });

  app.get(
    '/api/achievement/own',
    passport.authenticate('bearer', { failureRedirect: '/login' }),
    (req, res) => {
      const connection = connectionDB();
      const promise = getOwnAchievements(connection, req.user.userId);

      promise.then((result) => {
        connection.end();
        res.send({ achievements: result });
      }).catch((err) => {
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
    });

  app.get(
    '/api/achievement/list',
    (_, res) => {
      const connection = connectionDB();
      const promise = getAchievements(connection);

      promise.then((result) => {
        connection.end();
        res.send({ achievements: result });
      }).catch((err) => {
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
    });

  app.post(
    '/api/achievement/set',
    passport.authenticate('bearer', { failureRedirect: '/login' }),
    (req, res) => {
      const { userId, achievementId } = req.body;

      if (!userId || typeof userId !== 'number') {
        return res.status(422).send('Unprocessed entity');
      }
      if (!achievementId || typeof achievementId !== 'number') {
        return res.status(422).send('Unprocessed entity');
      }
      const connection = connectionDB();
      const promise = setAchievements(connection, userId, achievementId);
      promise.then((result) => {
        connection.end();
        res.send({ achievement: result });
      }).catch((err) => {
        console.log('err', err);
        res.sendStatus(ERROR_CODE);
      });
    });
}

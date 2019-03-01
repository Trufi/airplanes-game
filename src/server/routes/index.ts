import { Express } from 'express';
import { mapMap } from '../../utils';
import * as game from '../games/game';
import { State } from '../types';
import * as passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { connectionDB } from '../models/database';
import { createUser, selectUser } from '../models/user';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new BearerStrategy((token: string, done: any) => {
  console.log('token', token);
  return done(null, { user: 1, token: 2 }, { scope: 'all' });
});

export function applyRouter(app: Express, state: State) {
  passport.use(strategy);

  app.get('/state', (_req, res) => {
    const data = {
      games: mapMap(state.games.map, game.debugInfo),
      connections: Array.from(state.connections.map).map((v) => {
        const { id, status } = v[1];
        return {
          id,
          status,
        };
      }),
    };
    res.send(JSON.stringify(data, null, 2));
  });

  app.post('/register', (req, res) => {
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
    });
  });

  app.post('/login', passport.authenticate('bearer', { failureRedirect: '/login' }), (req, res) => {
    console.log('req', req.body);
    const connection = connectionDB();
    const promise = selectUser(connection, 1);
    promise.then((result) => {
      connection.end();
      console.log('result', result);
      res.redirect('/');
    });
  });
}

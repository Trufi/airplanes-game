import { Express } from 'express';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import { json } from 'body-parser';

export function applyMiddlewares(app: Express) {
  app.use(json());
  app.use(expressSession({ secret: 'SOME_SECRET', resave: true, saveUninitialized: true }));
  app.use(passport.initialize());
  app.use(passport.session());
}

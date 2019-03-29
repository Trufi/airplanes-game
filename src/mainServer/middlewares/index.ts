import { Express } from 'express';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import { json, urlencoded } from 'body-parser';
import * as compression from 'compression';
import * as RateLimit from 'express-rate-limit';
import * as slowDown from 'express-slow-down';
import { mainServer } from '../../config';

const rateLimiter = new RateLimit({
  windowMs: mainServer.protector.windowMs,
  max: mainServer.protector.edgeCountRequest,
  keyGenerator: (req) => {
    return req.ip;
  },
});

const speedLimiter = slowDown({
  windowMs: mainServer.protector.windowMs,
  delayAfter: mainServer.protector.edgeCountRequest,
  delayMs: mainServer.protector.delayMs,
  keyGenerator: (req) => {
    return req.ip;
  },
});

export function applyMiddlewares(app: Express) {
  app.enable('trust proxy');
  app.use(speedLimiter);
  app.use(['/api/register', '/api/login'], rateLimiter);
  app.use(['/api/register', '/api/login'], speedLimiter);
  app.use(compression());
  app.use(expressSession({ secret: 'SOME_SECRET', resave: true, saveUninitialized: true }));
  app.use(urlencoded({ extended: false }));
  app.use(json());
  app.use(passport.initialize());
  app.use(passport.session());
}

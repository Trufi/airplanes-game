import * as express from 'express';
import * as Joi from 'joi';
import { State } from './types';
import { mapMap } from '../utils';
import * as game from './games/game';
import { RestartRequest, KickAllRequest } from './types/api';
import { Cmd } from './commands';
import * as api from './services/main';
import { restartInSeconds, kickAll } from './reducers';

const secret = '2gistop1';

const kickallScheme = Joi.object().keys({
  secret: Joi.string()
    .allow(secret)
    .required(),
});

const restartScheme = Joi.object().keys({
  name: Joi.string()
    .min(1)
    .required(),
  duration: Joi.number()
    .min(0)
    .required(),
  inSeconds: Joi.number()
    .min(0)
    .required(),
  secret: Joi.string()
    .allow(secret)
    .required(),
  grand: Joi.any(),
});

const metrics = `# HELP sky_game_active_players Active players in game
# TYPE sky_game_active_players gauge
sky_game_active_players [PLAYERS]`;

export const applyRoutes = (app: express.Express, state: State, executeCmd: (cmd: Cmd) => void) => {
  // health check для k8s
  app.get('/', (_req, res) => res.sendStatus(200));

  // Metrics
  app.get('/metrics', (_, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');

    // @TODO КОСТЫЛЬ PIZDEC NAHOY BLYAT
    // быстрый фикс. Текст всегда надо прижимать.
    // иначе метрика начинает гнать - воспринимает как лишние отступы.
    res.send(metrics.replace('[PLAYERS]', state.game.players.size.toString()));
  });

  app.get('/state', (_req, res) => {
    const result = {
      type: state.type,
      url: state.url,
      connections: mapMap(state.connections.map, ({ id, status }) => ({ id, status })),
      game: game.debugInfo(state.game),
    };
    res.send(JSON.stringify(result));
  });

  app.get('/kickall', (req, res) => {
    const query = req.query as KickAllRequest;

    const { error } = kickallScheme.validate(query);
    if (error) {
      const msg = `Kick all bad request ${error.message}`;
      console.log(msg);
      res.sendStatus(400);
      return;
    }

    kickAll(state);

    const msg = 'Kick all players';
    console.log(msg);
    res.status(200).send(msg);
  });

  app.get('/restart', (req, res) => {
    const query = req.query as RestartRequest;

    const { error, value } = restartScheme.validate(query);
    if (error) {
      const msg = `Restart bad request ${error.message}`;
      console.log(msg);
      res.status(400).send(msg);
      return;
    }

    const duration = Number(value.duration) * 60 * 1000;
    const tournamentName = value.name;
    const inSeconds = Number(value.inSeconds);
    const isGrandFinal = Boolean(query.grand);

    api
      .getTournamentList()
      .then((data) => {
        const tournament = data.tournaments.find((t) => t.machine_name === tournamentName);
        if (!tournament) {
          const msg =
            `Tournament with name: ${tournamentName} not found, ` +
            `available names: ${data.tournaments.map((t) => t.machine_name)}`;
          console.log(msg);
          res.status(500).send(msg);
          return;
        }

        const { id } = tournament;

        const msg =
          `Restart game after ${inSeconds} seconds with tournament id: ${id}, ` +
          `duration: ${duration}, grandFinal: ${isGrandFinal}`;

        console.log(msg);
        executeCmd(
          restartInSeconds(state, {
            tournamentId: id,
            duration,
            inSeconds,
            isGrandFinal,
          }),
        );
        return res.status(200).send(msg);
      })
      .catch((reason) => {
        res.status(400).send(reason);
        console.log(`Restart get tournament list error, reason: ${reason}`);
      });
  });
};

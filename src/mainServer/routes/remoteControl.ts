import * as express from 'express';
import axios from 'axios';
import { State, Game } from '../types';
import { Tournament } from '../models/types';
import { TournamentListResponse } from '../types/api';
import { connectionDB } from '../models/database';
import { getTournamentList } from '../models/tournaments';
import { RestartRequest } from '../../gameServer/types/api';
import { mapMap } from '../../utils';

const secret = '2gistop1';

export const applyRemoteControl = (app: express.Express, state: State) => {
  const router = express.Router();

  router.get('/restart/:tournamentName/:seconds', (req, res) => {
    if (req.query.secret !== secret) {
      console.log(`Remote control restart bad secret: ${req.query.secret}`);
      return res.sendStatus(403);
    }

    const { tournamentName } = req.params;
    const seconds = Number(req.params.seconds);

    if (!tournamentName || tournamentName.length < 1 || Number.isNaN(seconds)) {
      return res.sendStatus(404);
    }

    const connection = connectionDB();
    getTournamentList(connection)
      .then((tournaments: Tournament[]) => {
        connection.end().then(() => {
          const result: TournamentListResponse = { tournaments };

          const tournament = result.tournaments.find(
            (tournament) => tournament.machine_name === tournamentName,
          );

          if (!tournament) {
            console.log(`Remote control tournament with name: ${tournamentName} not found`);
            return res.status(404).send(
              JSON.stringify({
                error: `tournament with name: "${tournamentName}" not found`,
                tournaments,
              }),
            );
          }

          restartAllGames(state, tournament, seconds);

          res.sendStatus(200);
        });
      })
      .catch((err: any) => {
        connection.end().then(() => {
          console.log(`Remote control tournament (name: ${tournamentName}) list error`, err);
          res.sendStatus(501);
        });
      });
  });

  router.get('/status', (_res, req) => {
    req.send(
      JSON.stringify({
        servers: mapMap(state.games.map, (game) => game),
      }),
    );
  });

  app.use('/remotecontrol', router);
};

const restartAllGames = (state: State, tournament: Tournament, seconds: number) => {
  state.games.map.forEach((game) => {
    restartGame(game, tournament, seconds);
  });
};

const restartGame = (game: Game, tournament: Tournament, inSeconds: number) => {
  const data: RestartRequest = {
    tournamentId: tournament.id,
    inSeconds,
    durationMinutes: tournament.duration_min,
  };

  axios
    .post<void>(`http://${game.url}/restart`, data)
    .then(() => {
      console.log(`Success restart game ${game.url}`);
    })
    .catch((err) => {
      console.log(`Restart game ${game.url} error ${err}`);
    });
};

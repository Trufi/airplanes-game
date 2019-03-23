import axios, { AxiosResponse } from 'axios';
import * as config from '../../../config';
import { User } from '../types';

export const getTournamentList = () => {
  return axios
    .get(config.mainServer.url + '/api/tournament/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response: AxiosResponse<User>) => response.data);
};

export const getTournamentPretenders = () => {
  return axios
    .get(config.mainServer.url + '/api/tournament/pretenders', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response: AxiosResponse<User>) => response.data);
};

export const attachUserTournament = (p: { tournamentId: number; token: string }) => {
  return axios
    .post(
      config.mainServer.url + '/api/tournament/attach',
      {
        tournamentId: p.tournamentId,
        token: p.token,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${p.token}`,
        },
      },
    )
    .then((response: AxiosResponse<User>) => response.data);
};

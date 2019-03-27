import axios, { AxiosResponse } from 'axios';
import * as config from '../../../config';
import { User } from '../types';
import { TournamentListResponse } from '../../../mainServer/types/api';

export const getTournamentList = () => {
  return axios
    .get<TournamentListResponse>(config.mainServer.url + '/api/tournament/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
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

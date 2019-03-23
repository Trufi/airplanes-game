import axios from 'axios';
import * as config from '../../config';
import { NotifyRequest, PlayerRequest, PlayerResponse } from '../../mainServer/types/gameApi';
import { TournamentListResponse } from '../../mainServer/types/api';

const baseURL = `${config.mainServer.url}/game`;

export const notify = (data: NotifyRequest) => {
  return axios.post<void>(`${baseURL}/notify`, data).then((data) => data.data);
};

export const player = (data: PlayerRequest) => {
  return axios.post<PlayerResponse>(`${baseURL}/player`, data).then((data) => data.data);
};

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

import axios from 'axios';
import * as config from '../../config';
import {
  NotifyRequest,
  PlayerRequest,
  PlayerResponse,
  AddPlayerStatsRequest,
} from '../../mainServer/types/gameApi';
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
    .get<TournamentListResponse>(baseURL + '/tournament/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
};

export const addPlayerStats = (playerId: number, data: AddPlayerStatsRequest) => {
  return axios.post<void>(`${baseURL}/player/${playerId}/stats`, data).then((data) => data.data);
};

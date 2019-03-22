import axios from 'axios';
import * as config from '../../config';
import { NotifyRequest, PlayerRequest, PlayerResponse } from '../../mainServer/types/gameApi';

const baseURL = `${config.mainServer.url}/game`;

export const notify = (data: NotifyRequest) => {
  return axios.post<void>(`${baseURL}/register`, data).then((data) => data.data);
};

export const player = (data: PlayerRequest) => {
  return axios.post<PlayerResponse>(`${baseURL}/player`, data).then((data) => data.data);
};

import axios from 'axios';
import * as config from '../../config';
import {
  RegisterResponse,
  RegisterRequest,
  PlayerRequest,
  PlayerResponse,
  UpdateRequest,
} from '../../mainServer/types/gameApi';

const baseURL = `${config.servers.main}/game`;

export const register = (data: RegisterRequest) => {
  return axios
    .post<RegisterResponse>(`${baseURL}/register`, data)
    .then((data) => data.data)
    .catch((err) => console.error(err));
};

export const update = (data: UpdateRequest) => {
  return axios
    .post<void>(`${baseURL}/update`, data)
    .then((data) => data.data)
    .catch((err) => console.error(err));
};

export const player = (data: PlayerRequest) => {
  return axios
    .post<PlayerResponse>(`${baseURL}/player`, data)
    .then((data) => data.data)
    .catch((err) => console.error(err));
};

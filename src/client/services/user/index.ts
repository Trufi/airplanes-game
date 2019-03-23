import axios, { AxiosResponse } from 'axios';
import * as config from '../../../config';
import { User, UserStats } from '../types';

export const userRegister = (p: { password: string; username: string }) => {
  return axios
    .post(
      config.mainServer.url + '/api/register',
      {
        password: p.password,
        username: p.username,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .then((response: AxiosResponse<User>) => response.data);
};

export const userLogin = (p: { password: string; username: string }) => {
  return axios
    .post(
      config.mainServer.url + '/api/login',
      {
        password: p.password,
        username: p.username,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    .then((response: AxiosResponse<User>) => response.data);
};

/**
 * В данном запросе присылываем статистику за матч,
 * т.е. сколько надо добавить очков
 */
export const userAuth = (p: { token: string }) => {
  return axios
    .post(
      config.mainServer.url + '/api/auth',
      {},
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

/**
 * Получаем статистику по турниру (kills, death, points)
 */
export const attachUserTournament = (p: { tournamentId: number; token: string }) => {
  return axios
    .get(`${config.mainServer.url}/api/user/tournament/${p.tournamentId}/stats`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    })
    .then((response: AxiosResponse<UserStats>) => response.data);
};

/**
 * В данном запросе присылываем статистику за матч,
 * т.е. сколько надо добавить очков
 */
export const userUpdateStat = (p: {
  token: string;
  tournamentId: number;
  deaths: number;
  kills: number;
  points: number;
}) => {
  return axios
    .post(
      `${config.mainServer.url}/api/user/tournament/${p.tournamentId}/stats`,
      {
        deaths: p.deaths,
        kills: p.kills,
        points: p.points,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${p.token}`,
        },
      },
    )
    .then((response: AxiosResponse) => response.data);
};

import axios from 'axios';
import { services } from '../../../config';

export const userRegister = (p: { password: string, username: string }) => {
  return axios.post(
    services.apiDomain + '/api/register',
    {
      password: p.password,
      username: p.username,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ).then((data: any) => data.data);
};

export const userLogin = (p: { password: string, username: string }) => {
  return axios.post(
    services.apiDomain + '/api/login',
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
  ).then((data: any) => data.data);
};

/**
 * В данном запросе присылываем статистику за матч,
 * т.е. сколько надо добавить очков
 */
export const userAuth = (p: { token: string }) => {
  return axios.post(
    services.apiDomain + '/api/auth',
    {},
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    },
  ).then((data: any) => data.data);
};

/**
 * В данном запросе присылываем статистику за матч,
 * т.е. сколько надо добавить очков
 */
export const userUpdateStat = (p: { token: string, deaths: number, kills: number, points: number }) => {
  return axios.post(
    services.apiDomain + '/api/login',
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
  ).then((data: any) => data.data);
};

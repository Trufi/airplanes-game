import axios, { AxiosResponse } from 'axios';
import * as config from '../../../config';
import { User } from '../types';
import { CanIjoinToGrandFinalResponse } from '../../../mainServer/types/api';

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

export const canIjoinToGrandFinal = (p: { token: string }) => {
  return axios
    .get<CanIjoinToGrandFinalResponse>(config.mainServer.url + '/api/user/canIjoinToGrandFinal', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    })
    .then((res) => res.data);
};

import { services } from '../config';
import axios from 'axios';
import { GamelistResponse } from '../../../mainServer/types/api';

export const getList = (p: { token: string }) => {
  return axios
    .get<GamelistResponse>(services.apiDomain + '/api/gamelist', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    })
    .then((data) => data.data);
};

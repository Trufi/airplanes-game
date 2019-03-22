import axios from 'axios';
import * as config from '../../../config';
import { GamelistResponse } from '../../../mainServer/types/api';

export const getList = (p: { token: string }) => {
  return axios
    .get<GamelistResponse>(config.mainServer.url + '/api/gamelist', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    })
    .then((data) => data.data);
};

import { services } from '../../../config';
import axios from 'axios';

export const getList = (p: { token: string }) => {
  return axios.get(
    services.apiDomain + '/api/gamelist',
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p.token}`,
      },
    },
  ).then((data: any) => data.data);
};
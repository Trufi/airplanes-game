import { createConnection } from 'mysql';
import { config } from '../../dbConfig';

export const connectionDB = () => {
  return createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });
};
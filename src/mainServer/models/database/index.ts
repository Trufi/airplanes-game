// import { Client } from 'pg';
// import { config } from '../../dbConfig';

export const connectionDB = () => {
  // const clientPgsql = new Client({
  //   user: config.db.user,
  //   host: config.db.host,
  //   database: config.db.database,
  //   password: config.db.password,
  //   port: config.db.port,
  // });
  // clientPgsql.connect();

  // return clientPgsql;

  return {
    query: (_args: any[]) => ({} as any),
    end: () => Promise.resolve(),
  } as any;
};

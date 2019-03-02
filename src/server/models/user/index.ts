import { Connection } from 'mysql';
import { User, UserCreation } from '../types';

const parseResult = (result: any) => {
  const string = JSON.stringify(result);
  return JSON.parse(string);
};

export const createUser = (connection: Connection, user: UserCreation) => {
  const sql = `
    INSERT INTO users (name, password, kills, points, deaths)
    VALUES
      (
        '${user.name}',
        '${user.password}',
        0,
        0,
        0
      )
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult(result)[0]);
    });
  });
};

export const updateUserStats = (
  connection: Connection,
  userId: User['id'],
  stats: { kills: User['kills'], deaths: User['deaths'], points: User['points'] },
) => {
  const sql = `
    UPDATE users
    SET
      deaths=${stats.deaths},
      kills=${stats.kills},
      points=${stats.points}
    WHERE id=${userId};
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult(result)[0]);
    });
  });
};

export const selectUser = (connection: Connection, userId: User['id']) => {
  const sql = `
    SELECT id, name, kills, points, deaths
    FROM users
    WHERE users.id = ${userId}
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult(result)[0]);
    });
  });
};

export const selectUserByToken = (connection: Connection, password: User['password']) => {
  const sql = `
    SELECT u.id, u.name, u.kills, u.points, u.deaths
    FROM users as u
    WHERE u.password = '${password}'
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult(result)[0]);
    });
  });
};

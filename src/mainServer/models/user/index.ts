import { Client } from 'pg';
import { User, UserCreation } from '../types';
import { createHmac } from 'crypto';

const DEFAULT_TOURNAMENT_NAME = 'infinity';

const parseResult = (result: any) => {
  const string = JSON.stringify(result.rows);
  return JSON.parse(string);
};

export const createToken = (p: { name: string; password: string }) => {
  return createHmac('sha256', `${p.name}${p.password}`).digest('hex');
};

export const createUser = (connection: Client, user: UserCreation) => {
  // @TODO Уставновить рейтинг Эло. 1200 [#ratingElo]
  const sqlUserCreate = `
    INSERT INTO users (name, password)
    VALUES
      (
        '${user.name}',
        '${user.password}'
      )
  `;

  return new Promise((resolve, reject) => {
    connection.query(sqlUserCreate, (err, result) => {
      if (err) {
        return reject(err);
      }
      const user = parseResult(result)[0];

      selectDefaultTournament(connection).then((defaultTournament: any) => {
        const sqlLinkWithDefaultTournament = `
            INSERT INTO tournaments_per_user (user_id, tournament_id)
            VALUES
              (
                '${user.id}',
                '${defaultTournament.id}'
              )
          `;

        connection.query(sqlLinkWithDefaultTournament, (err, result) => {
          if (err) {
            return reject(err);
          }
          const tournamentData = parseResult(result)[0];

          return resolve({
            user,
            tournamentData,
          });
        });
      });
    });
  });
};

const selectDefaultTournament = (connection: Client) => {
  const sql = `
    SELECT id
    FROM tournament as t
    WHERE t.name = ${DEFAULT_TOURNAMENT_NAME}
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

export const updateUserStats = (
  connection: Client,
  userId: User['id'],
  stats: { kills: User['kills']; deaths: User['deaths']; points: User['points'] },
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

export const selectUser = (connection: Client, userId: User['id']) => {
  const sql = `
    SELECT id, name, password
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

export const selectUserByName = (connection: Client, name: User['name']) => {
  const sql = `
    SELECT u.id, u.name
    FROM users as u
    WHERE u.name = '${name}'
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

export const selectUserByToken = (connection: Client, password: User['password']) => {
  const sql = `
    SELECT u.id, u.name
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

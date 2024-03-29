import { Client } from 'pg';
import { Tournament, User, UserCreation, UserStats } from '../types';
import { createHmac } from 'crypto';
import { parseResult } from '../utils';
import { selectDefaultTournament } from '../tournaments';

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
  return connection.query(sqlUserCreate).then(() =>
    selectUserAfterInsert(connection, user.name).then((userData: User) =>
      selectDefaultTournament(connection).then((defaultTournament: Tournament) => {
        const sqlLinkWithDefaultTournament = `
          INSERT INTO tournaments_per_user (user_id, tournament_id)
          VALUES
            (
              '${userData.id}',
              '${defaultTournament.id}'
            )
        `;

        return connection.query(sqlLinkWithDefaultTournament);
      }),
    ),
  );
};

export const attachUserToTournament = (
  connection: Client,
  userId: User['id'],
  tournamentId: Tournament['id'],
  stats: { kills: Tournament['kills']; deaths: Tournament['deaths']; points: Tournament['points'] },
) => {
  // @TODO Уставновить рейтинг Эло. 1200 [#ratingElo]
  const sql = `
    INSERT INTO tournaments_per_user (user_id, tournament_id, deaths, kills, points)
    VALUES
      (
        ${userId},
        ${tournamentId},
        ${stats.deaths},
        ${stats.kills},
        ${stats.points}
      )`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

export const updateUserStats = (
  connection: Client,
  userId: User['id'],
  tournamentId: Tournament['id'],
  stats: { kills: Tournament['kills']; deaths: Tournament['deaths']; points: Tournament['points'] },
) => {
  const sql = `
    UPDATE tournaments_per_user
    SET
      deaths=${stats.deaths},
      kills=${stats.kills},
      points=${stats.points}
    WHERE user_id=${userId} AND tournament_id=${tournamentId};
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

export const selectUser = (connection: Client, userId: User['id']): Promise<User> => {
  const sql = `
    SELECT u.id, u.name, u.password
    FROM users as u
    WHERE u.id = ${userId}
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<User>(result)[0]);
    });
  });
};

export const selectUserByName = (connection: Client, name: User['name']): Promise<User> => {
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
      return resolve(parseResult<User>(result)[0]);
    });
  });
};

export const selectUserByToken = (
  connection: Client,
  password: User['password'],
): Promise<User> => {
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
      return resolve(parseResult<User>(result)[0]);
    });
  });
};

export const getUserStatsByTournament = (
  connection: Client,
  userId: User['id'],
  tournamentId: Tournament['id'],
): Promise<UserStats | undefined> => {
  const sql = `
    SELECT u.id, u.name, tpr.kills, tpr.deaths, tpr.points
      FROM users as u
      LEFT JOIN tournaments_per_user as tpr ON tpr.user_id = u.id
    WHERE u.id = ${userId} AND tpr.tournament_id = ${tournamentId}
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<UserStats>(result)[0]);
    });
  });
};

export const getUserLadder = (
  connection: Client,
  tournamentId: Tournament['id'],
): Promise<UserStats[]> => {
  const sql = `
    SELECT u.id, u.name, tpr.kills, tpr.deaths, tpr.points
    FROM users as u
    LEFT JOIN tournaments_per_user as tpr ON tpr.user_id = u.id
    WHERE tpr.tournament_id = ${tournamentId}
    ORDER BY tpr.points DESC
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<UserStats>(result));
    });
  });
};

const selectUserAfterInsert = (connection: Client, username: User['name']): Promise<User> => {
  const sql = `
    SELECT u.id, u.name, u.password
    FROM users as u
    WHERE u.name = '${username}'
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<User>(result)[0]);
    });
  });
};

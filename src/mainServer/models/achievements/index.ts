import { Client } from 'pg';
import { Achievement, User } from '../types';
import { parseResult } from '../utils';

export const getAchievements = (connection: Client): Promise<Achievement[]> => {
  const sql = `
    SELECT id, name, description
    FROM achievements
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Achievement>(result));
    });
  });
};

export const getOwnAchievements = (
  connection: Client,
  userId: User['id'],
): Promise<Achievement[]> => {
  const sql = `
    SELECT ach.id, ach.name, ach.description
    FROM achievements AS ach
    LEFT JOIN achievements_has_users as ahu
    ON ach.id = ahu.achievements_id
    WHERE ahu.users_id = ${userId}
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Achievement>(result));
    });
  });
};

export const setAchievements = (
  connection: Client,
  userId: User['id'],
  achievementId: Achievement['id'],
) => {
  const sql = `
    INSERT INTO achievements_has_users (achievements_id,users_id)
    VALUES(${achievementId},${userId})
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

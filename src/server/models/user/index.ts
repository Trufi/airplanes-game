import { Connection } from 'mysql';

interface UserCreation {
  name: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  password: string;
  sessionId: string;
  kills?: number;
  death?: number;
  points?: number;
}

export const createUser = (connection: Connection, user: UserCreation) => {
  const sql = `
    INSERT INTO users (name, password, kills, points, deaths)
    VALUES ('${user.name}', '${user.password}', 0, 0, 0)
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
      return resolve(result);
    });
  });
};

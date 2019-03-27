import { Client, QueryResult } from 'pg';
import { Tournament, Pretender } from '../types';
import { parseResult } from '../utils';

export const DEFAULT_TOURNAMENT_NAME = 'infinity';

export const selectDefaultTournament = (connection: Client): Promise<Tournament> => {
  const sql = `
    SELECT id
    FROM tournament as t
    WHERE t.name = '${DEFAULT_TOURNAMENT_NAME}'
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Tournament>(result)[0]);
    });
  });
};

export const selectTournamentById = (
  connection: Client,
  tournamentId: Tournament['id'],
): Promise<Tournament> => {
  const sql = `
    SELECT
     t.id,
     t.name,
     t.machine_name,
     t.description,
     t.start_on,
     t.duration_min,
     t.input_count,
     t.output_count,
     t.is_grand_final
    FROM tournament as t
    WHERE t.id = ${tournamentId}
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Tournament>(result)[0]);
    });
  });
};

export const getTournamentList = (connection: Client): Promise<Tournament[]> => {
  const sql = `
    SELECT
     t.id,
     t.name,
     t.machine_name,
     t.description,
     t.start_on,
     t.duration_min,
     t.input_count,
     t.output_count,
     t.is_grand_final
    FROM tournament as t
    WHERE t.name <> '${DEFAULT_TOURNAMENT_NAME}'
    ORDER BY t.start_on
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Tournament>(result));
    });
  });
};

/**
 * В отличие от getTournamentList, возвращает все турниры, включая infinity
 */
export const getFullTournamentList = (connection: Client): Promise<Tournament[]> => {
  const sql = `
    SELECT
     t.id,
     t.name,
     t.machine_name,
     t.description,
     t.start_on,
     t.duration_min,
     t.input_count,
     t.output_count,
     t.is_grand_final
    FROM tournament as t
    ORDER BY t.start_on
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(parseResult<Tournament>(result));
    });
  });
};

export const getPretenders = (connection: Client): Promise<Pretender[]> => {
  return new Promise((resolve, reject) => {
    getTournamentList(connection).then((tournaments: Tournament[]) => {
      const sql = getPretendersQuery(tournaments);

      connection.query(sql, (err, result: QueryResult) => {
        if (err) {
          return reject(err);
        }
        return resolve(parseResult<Pretender>(result));
      });
    });
  });
};

function getPretendersQuery(tournaments: Tournament[]) {
  return tournaments.reduce((sql: string, tournament: Tournament, idx: number) => {
    // Тянем всех лидеров существующих турниров
    sql += '(';
    sql += `
          SELECT
            t.id as tournament_id,
            u.id as user_id,
            t.name as tournament,
            u.name as username,
            tpu.points
          FROM users as u
          LEFT JOIN tournaments_per_user as tpu ON u.id = tpu.user_id
          LEFT JOIN tournament as t ON tpu.tournament_id = t.id
          WHERE t.name <> 'infinity'
            AND tpu.tournament_id = ${tournament.id}
            AND t.is_grand_final <> 1
          ORDER BY t.id, tpu.points DESC
          LIMIT ${tournament.output_count}
        `;
    sql += ')';
    if (tournaments.length - 1 !== idx) {
      sql += `UNION`;
    } else {
      // Тянем всех игроков с флагом FORCE
      sql += 'UNION';
      sql += '(';
      sql += `
          SELECT
            t.id as tournament_id,
            u.id as user_id,
            t.name as tournament,
            u.name as username,
            tpu.points
          FROM users as u
          LEFT JOIN tournaments_per_user as tpu ON u.id = tpu.user_id
          LEFT JOIN tournament as t ON tpu.tournament_id = t.id
          WHERE t.name <> 'infinity' AND tpu.force = 1
          ORDER BY t.id, tpu.points DESC
        `;
      sql += ')';
    }
    return sql;
  }, '');
}

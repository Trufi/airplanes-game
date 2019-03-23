import { QueryResult } from 'pg';

export function parseResult<T>(result: QueryResult) {
  const string = JSON.stringify(result.rows);
  return JSON.parse(string) as T[];
}

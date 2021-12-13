import { createHmac } from 'crypto';
import { Pretender, Tournament, User, UserCreation, UserStats } from '../types';

interface DbUser {
  id: number;
  name: string;
  password: string;
  kills: number;
  deaths: number;
  points: number;
}

const users: DbUser[] = [];

let idCounter = 1;

export const createToken = (p: { name: string; password: string }) => {
  return createHmac('sha256', `${p.name}${p.password}`).digest('hex');
};

export async function selectUserByName(
  _connection: any,
  username: string,
): Promise<User | undefined> {
  const user = users.find((user) => user.name === username);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      password: user.password,
    };
  }
}

export async function createUser(_connection: any, user: UserCreation) {
  users.push({
    id: idCounter++,
    name: user.name,
    password: user.password,
    kills: 0,
    deaths: 0,
    points: 0,
  });
}

export async function selectUserByToken(
  _connection: any,
  token: string,
): Promise<User | undefined> {
  const user = users.find((user) => user.password === token);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      password: user.password,
    };
  }
}

export async function selectUser(_connection: any, userId: User['id']): Promise<User> {
  const user = users.find((user) => user.id === userId);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      password: user.password,
    };
  }

  throw new Error();
}

export async function getUserStatsByTournament(
  _connection: any,
  userId: User['id'],
  _tournamentId: Tournament['id'],
): Promise<UserStats> {
  const user = users.find((user) => user.id === userId);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      kills: user.kills,
      deaths: user.deaths,
      points: user.points,
    };
  }

  throw new Error();
}

export async function getUserLadder(
  _connection: any,
  _tournamentId: Tournament['id'],
): Promise<UserStats[]> {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    kills: user.kills,
    deaths: user.deaths,
    points: user.points,
  }));
}

export const updateUserStats = async (
  _connection: any,
  userId: User['id'],
  _tournamentId: Tournament['id'],
  stats: { kills: Tournament['kills']; deaths: Tournament['deaths']; points: Tournament['points'] },
) => {
  const user = users.find((user) => user.id === userId);
  if (user) {
    if (stats.deaths !== undefined) {
      user.deaths = stats.deaths;
    }
    if (stats.kills !== undefined) {
      user.kills = stats.kills;
    }
    if (stats.points !== undefined) {
      user.points = stats.points;
    }
  }
};

export const attachUserToTournament = async (
  _connection: any,
  _userId: User['id'],
  _tournamentId: Tournament['id'],
  _stats: {
    kills: Tournament['kills'];
    deaths: Tournament['deaths'];
    points: Tournament['points'];
  },
) => {};

export const getTournamentList = async (_connection: any): Promise<Tournament[]> => {
  return [];
};

export const getFullTournamentList = async (_connection: any): Promise<Tournament[]> => {
  return [];
};

export const getPretenders = async (_connection: any): Promise<Pretender[]> => {
  return [];
};

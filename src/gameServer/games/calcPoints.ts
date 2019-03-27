import { addPlayerStats } from '../services/main';

export const addPointsDelta = (
  playerId: number,
  delta: {
    kills?: number;
    deaths?: number;
    points: number;
  },
  tournamentId: number,
) => {
  const { kills = 0, deaths = 0, points } = delta;

  addPlayerStats(playerId, {
    kills,
    deaths,
    points,
    tournamentId,
  });
};

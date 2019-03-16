import { connectionDB } from '../models/database';
import { selectUserByName, updateUserStats } from '../models/user';
import { GamePlayer } from './game';
import { points } from './config';

export const updatePointsByType = (player: GamePlayer, type: 'deaths' | 'kills') => {
  const connection = connectionDB();
  selectUserByName(connection, player.name)
    .then((user: any) =>
      updateUserStats(connection, user.id, {
        kills: Number(user.kills) + (type === 'kills' ? 1 : 0),
        deaths: Number(user.deaths) + (type === 'deaths' ? 1 : 0),
        points: getPointsFromStat(Number(user.points), type),
      }),
    )
    .then(() => {
      connection.end();
      return Promise.resolve();
    })
    .catch((err) => {
      connection.end();
      console.log('Error in updatePointsByType. Details: ', err);
      return Promise.resolve();
    });
};

const getPointsFromStat = (currentPoints: number, type: 'deaths' | 'kills') => {
  // @TODO использовать рейтинг Эло. Для начисления рейтинга. [#ratingElo]
  // https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B9%D1%82%D0%B8%D0%BD%D0%B3_%D0%AD%D0%BB%D0%BE
  const newPoints = currentPoints + (points[type] ? points[type] : 0);
  return points[type] ? (newPoints >= 0 ? newPoints : 0) : currentPoints;
};

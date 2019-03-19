import { GamePlayer } from './game';
// import { getNewPoints } from '../../utils';

export const updatePointsByType = (_player: GamePlayer, _type: 'deaths' | 'kills') => {
  // const connection = connectionDB();
  // selectUserByName(connection, player.name)
  //   .then((user: any) =>
  //     updateUserStats(connection, user.id, {
  //       kills: Number(user.kills) + (type === 'kills' ? 1 : 0),
  //       deaths: Number(user.deaths) + (type === 'deaths' ? 1 : 0),
  //       points: getNewPoints(Number(user.points), type),
  //     }),
  //   )
  //   .then(() => {
  //     connection.end();
  //     return Promise.resolve();
  //   })
  //   .catch((err) => {
  //     connection.end();
  //     console.log('Error in updatePointsByType. Details: ', err);
  //     return Promise.resolve();
  //   });
};

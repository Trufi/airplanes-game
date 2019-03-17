import * as React from 'react';
import { State } from '../types';
import { mapMap } from '../../utils';

interface Props {
  style?: React.CSSProperties;
  players: State['players'];
}

export const GameStats = ({ players, style }: Props) => {
  const playerArray = mapMap(players, (player) => player);
  playerArray.sort((a, b) => b.kills - a.kills);

  return (
    <table style={style}>
      <thead>
        <tr>
          <td>#</td>
          <td>Name</td>
          <td>Kills</td>
          <td>Deaths</td>
          <td>Points</td>
        </tr>
      </thead>
      <tbody>
        {playerArray.map((player, i) => (
          <tr key={i}>
            <td>{i}</td>
            <td>{player.name}</td>
            <td>{player.kills}</td>
            <td>{player.deaths}</td>
            <td>{player.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

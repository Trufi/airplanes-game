import * as React from 'react';
import { State } from '../types';
import { mapMap, clamp } from '../../utils';

interface Props {
  style?: React.CSSProperties;
  game: State;
}

export const GameStats = ({ game: { player, players }, style }: Props) => {
  const playerArray = mapMap(players, (player) => player);
  playerArray.sort((a, b) => b.points - a.points);

  const index = playerArray.findIndex((p) => p === player);

  const slice = playerArray
    .map((player, place) => ({ player, place }))
    .slice(clamp(index - 1, 0, playerArray.length), clamp(index + 2, 0, playerArray.length));

  return (
    <table style={style}>
      <thead>
        <tr>
          <td />
          <td>Name</td>
          <td>Kills</td>
          <td>Deaths</td>
          <td>Points</td>
        </tr>
      </thead>
      <tbody>
        {slice.map(({ player, place }) => (
          <tr key={place}>
            <td>{place}</td>
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

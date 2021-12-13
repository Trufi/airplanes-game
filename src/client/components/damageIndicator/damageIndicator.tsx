import * as React from 'react';
import { State } from '../../types';
import { mapMap } from '../../../utils';
import { Indicator } from './indicator';

interface Props {
  game: State;
}

export const DamageIndicator = ({ game }: Props) => {
  const {
    damageIndicator: { shooters },
  } = game;

  const shooterElements = mapMap(shooters, (s) => <Indicator key={s.hitTime} shooter={s} />);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        pointerEvents: 'none',
      }}
    >
      {shooterElements}
    </div>
  );
};

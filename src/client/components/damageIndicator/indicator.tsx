import * as React from 'react';
import { ShooterState } from '../../types';

import styles from './indicator.css';

interface Props {
  shooter: ShooterState;
}

export const Indicator = ({ shooter }: Props) => {
  const { direction } = shooter;

  const angle = Math.atan2(direction[1], direction[0]) + Math.PI / 2;

  const minSize = Math.min(window.innerHeight, window.innerWidth);

  const scale = minSize / 1000;
  const radius = minSize * 0.3;
  const x = Math.round(direction[0] * radius);
  const y = Math.round(direction[1] * radius);

  return (
    <img
      className={styles.indicator}
      style={{
        transform: `translate3d(${x}px,${y}px,0) rotateZ(${angle}rad) scale(${scale})`,
      }}
      src='./assets/damage_indicator.svg'
    />
  );
};

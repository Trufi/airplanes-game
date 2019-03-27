import * as React from 'react';
import { WeaponState } from '../types';

interface Props {
  weapon: WeaponState;
  time: number;
}

export const Aim = ({ weapon: { lastHitTime }, time }: Props) => {
  const width = 30;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${window.innerWidth / 2}px`,
        top: `${window.innerHeight / 2}px`,
      }}
    >
      <img
        style={{
          position: 'absolute',
          left: `${-width / 2}px`,
          top: `${-width / 2}px`,
          width: `${width}px`,
          opacity: 0.5,
        }}
        src='./assets/aim2.png'
      />
      {time - lastHitTime < 100 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: `${-width / 2}px`,
              width: `${width}px`,
              height: `2px`,
              background: '#ff0000',
              transform: `rotate(45deg)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${-width / 2}px`,
              width: `2px`,
              height: `${width}px`,
              background: '#ff0000',
              transform: `rotate(45deg)`,
            }}
          />
        </>
      )}
    </div>
  );
};

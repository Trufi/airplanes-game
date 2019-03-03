import * as React from 'react';
import * as config from '../../config';
import { PhysicBodyState } from '../types';

interface Props {
  body: PhysicBodyState;
}

export const Health = ({ body: { health } }: Props) => {
  const width = 300;
  const height = 15;

  const innerWidth = (health / config.airplane.maxHealth) * width;

  return (
    <div
      style={{
        position: 'absolute',
        top: '5px',
        left: '50%',
        marginLeft: `-${width / 2}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: `${innerWidth}px`,
          height: `${height}px`,
          background: 'rgba(255, 0, 0, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          textAlign: 'center',
          lineHeight: `${height}px`,
          width: '100%',
          height: '100%',
        }}
      >
        {health} / {config.airplane.maxHealth}
      </div>
    </div>
  );
};

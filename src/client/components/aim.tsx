import * as React from 'react';

export const Aim = () => {
  const width = 30;

  const x = window.innerWidth / 2 - width / 2;
  const y = window.innerHeight / 2 - width / 2;

  return (
    <img
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        opacity: 0.5,
      }}
      src='./assets/aim.png'
    />
  );
};

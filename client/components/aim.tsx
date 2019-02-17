import * as React from 'react';

export const Aim = () => {
  const width = 50;

  // TODO: положение прицела на экране должно зависеть от наклона самолета,
  // а не быть тупо в центре
  const x = window.innerWidth / 2 - width / 2;
  const y = window.innerHeight / 2 - width / 2;

  return (
    <img
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
      }}
      src='./assets/aim.png'
    />
  );
};

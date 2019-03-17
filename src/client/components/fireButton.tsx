import * as React from 'react';
import { State } from '../types';
import * as config from '../../config';

interface Props {
  game: State;
}

export class FireButton extends React.Component<Props, {}> {
  public render() {
    const {
      game: { body },
    } = this.props;

    const size = 50;
    let volume = 1;

    if (body) {
      const { weapon } = body;
      volume = 1 - weapon.heat / config.weapon.maxHeat;
    }
    return (
      <div
        style={{
          position: 'absolute',
          right: '60px',
          bottom: 0,
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          background: '#ff0000',
          border: '1px solid',
          textAlign: 'center',
          lineHeight: `${size}px`,
          fontSize: '20px',
          userSelect: 'none',
        }}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${size}px`,
            height: `${size * volume}px`,
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          Fire
        </div>
      </div>
    );
  }

  private onTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['Space'] = true;
  };

  private onTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['Space'] = false;
  };

  private onTouchMove = (ev: React.TouchEvent) => {
    ev.preventDefault();
  };
}

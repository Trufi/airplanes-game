import * as React from 'react';
import { State } from '../types';
import * as config from '../../config';

interface Props {
  game: State;
}

export class BoostButton extends React.Component<Props, {}> {
  public render() {
    const {
      game: { body },
    } = this.props;

    const size = 50;
    let volume = 1;

    if (body) {
      const { boost } = body;
      volume = boost.volume / config.boost.maxVolume;
    }

    return (
      <div
        style={{
          position: 'absolute',
          right: '130px',
          bottom: 0,
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          background: '#ff0000',
          border: '1px solid',
          textAlign: 'center',
          lineHeight: `${size}px`,
          fontSize: '30px',
          userSelect: 'none',
        }}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
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
          B
        </div>
      </div>
    );
  }

  private onTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyF'] = true;
  };

  private onTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyF'] = false;
  };
}

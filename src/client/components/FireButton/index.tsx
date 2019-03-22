import * as React from 'react';
import { State } from '../../types';
import * as config from '../../../config';
import styles from './index.css';
import { HeatCircle } from './HeatCircle';

interface Props {
  game: State;
}

export class FireButton extends React.Component<Props, {}> {
  public render() {
    const {
      game: { body },
    } = this.props;

    const size = 100;
    let volume = 1;

    if (body) {
      const { weapon } = body;
      volume = 1 - weapon.heat / config.weapon.maxHeat;
    }
    console.log('size: ', size);
    console.log('volume: ', volume);
    console.log('size vol: ', size * volume);
    return (
      <div
        className={styles.container}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
      >
        <div
          style={{
            position: 'absolute',
          }}
        >
          <HeatCircle percentage={size * volume} strokeWidth={10} diametr={92} />
        </div>
        <div className={styles.fireButton}>Fire</div>
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

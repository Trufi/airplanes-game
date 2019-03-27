import * as React from 'react';
import { State } from '../../types';
import * as config from '../../../config';
import styles from './index.css';

interface Props {
  game: State;
}

export class BoostButton extends React.Component<Props, {}> {
  public render() {
    const {
      game: { body },
    } = this.props;

    const size = 38;
    let volume = 1;

    if (body) {
      const { boost } = body;
      volume = boost.volume / config.boost.maxVolume;
    }
    const fillPercent = size - size * volume;

    return (
      <div className={styles.cover}>
        <div
          className={styles.boostContainer}
          onTouchStart={this.onBoostTouchStart}
          onTouchEnd={this.onBoostTouchEnd}
          onTouchMove={this.onBoostTouchMove}
        >
          <div className={styles.boost} />
          <div className={styles.boostLimitContainer}>
            <div className={styles.boostLimit} style={{ height: `${fillPercent}px` }} />
          </div>
        </div>
        <div
          className={styles.boostContainer}
          onTouchStart={this.onSlowTouchStart}
          onTouchEnd={this.onSlowTouchEnd}
          onTouchMove={this.onSlowTouchMove}
        >
          <div className={styles.slow} />
        </div>
      </div>
    );
  }

  private onBoostTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyF'] = true;
  };

  private onBoostTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyF'] = false;
  };

  private onBoostTouchMove = (ev: React.TouchEvent) => {
    ev.preventDefault();
  };

  private onSlowTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyR'] = true;
  };

  private onSlowTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.game.pressedKeys['KeyR'] = false;
  };

  private onSlowTouchMove = (ev: React.TouchEvent) => {
    ev.preventDefault();
  };
}

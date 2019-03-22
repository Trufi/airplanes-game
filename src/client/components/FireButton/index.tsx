import * as React from 'react';
import { State } from '../../types';
import * as config from '../../../config';
import styles from './index.css';
import { HeatCircle } from './HeatCircle';
import classnames from 'classnames';

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
    let isHeated = false;

    if (body) {
      const { weapon } = body;
      volume = 1 - weapon.heat / config.weapon.maxHeat;

      if (weapon) {
        isHeated = body.weapon.blocked;
      }
    }
    const fillPercent = 100 - size * volume;
    const buttonClass = classnames({
      [styles.fireButtonInner]: true,
      [styles.fireInProgress]: fillPercent > 0,
      [styles.fireDisabled]: isHeated,
    });
    return (
      <div
        className={styles.container}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
      >
        <div className={styles.heatContainer}>
          <HeatCircle percentage={fillPercent} strokeWidth={8} diametr={92} />
        </div>
        <div className={styles.fireButton}>
          <div className={styles.fireButtonCircle} />
          <div className={buttonClass}>Fire</div>
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

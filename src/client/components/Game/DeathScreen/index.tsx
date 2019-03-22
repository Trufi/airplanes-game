import * as React from 'react';
import { GameStats } from '../../gameStats';
import styles from './index.css';
import classNames from 'classnames';

interface Props {
  game: any;
  restart: any;
}

interface State {
  tick: any;
}

export class DeathScreen extends React.Component<Props, State> {
  private timer: any;

  constructor(props: any) {
    super(props);

    this.state = {
      tick: 9,
    };
    this.timer = 0;
  }

  public componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        tick: this.state.tick - 1,
      });
    }, 1000);
  }

  public componentWillUnmount() {
    this.stopTimer();
  }

  public stopTimer() {
    clearInterval(this.timer);
  }

  public render() {
    const { game, restart } = this.props;
    const { tick } = this.state;

    if (tick === 0) {
      this.stopTimer();
    }

    const restartButtonClass = classNames({
      [styles.restartButton]: true,
      [styles.isRestartDisabled]: tick > 0,
    });

    return (
      <div className={styles.deathScreen}>
        <div className={styles.topContainer}>
          <div className={styles.logo} />
          <div className={styles.counter}>
            <div className={styles.pointer} />
            <div className={styles.shadow} />
            <div>{tick !== 0 && tick}</div>
          </div>
        </div>
        <div className={styles.deathContent}>
          <div className={styles.box}>
            <div className={styles.stats}>
              <div>ПОТРАЧЕНО!</div>
              <GameStats players={game.players} />
            </div>
            <button className={restartButtonClass} onClick={restart}>
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }
}

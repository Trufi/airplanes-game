import * as React from 'react';
import { State as GameState } from '../../types';

import styles from './shotBlink.css';

interface Props {
  game: GameState;
}

interface State {
  isBlinking: boolean;
}

export class ShotBlink extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isBlinking: false,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { game } = this.props;
    const { body } = game;

    if (nextProps.game.body && body) {
      if (nextProps.game.body.health < body.health) {
        this.setState({
          isBlinking: true,
        });
        return;
      }

      if (body.health < 50) {
        this.setState({
          isBlinking: true,
        });
        return;
      }
    }

    this.setState({
      isBlinking: false,
    });
  }

  public render() {
    if (!this.state.isBlinking) {
      return null;
    }

    return <div className={styles.blink} />;
  }
}

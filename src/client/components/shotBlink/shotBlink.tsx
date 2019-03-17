import * as React from 'react';
import * as config from '../../../config';
import { PhysicBodyState } from '../../types';

import styles from './shotBlink.css';

interface Props {
  body: PhysicBodyState;
}

export class ShotBlink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isBlinking: false,
    };
  }

  public componentWillReceiveProps(nextProps) {
    const { game } = this.props;
    const { body } = game;

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

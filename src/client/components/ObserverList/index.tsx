import * as React from 'react';
import { ObserverState } from '../../observer/types';
import { mapToArray } from '../../../utils';
import * as control from '../../observer/control';
import styles from './index.css';

interface Props {
  observer: ObserverState;
}

interface State {
  x: number;
  y: number;
}

export class ObserverList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  public render() {
    const {
      observer: { players, bodies, control: controlState },
    } = this.props;

    const playersList = mapToArray(players);
    playersList.sort((a, b) => b.points - a.points);

    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logo} />
            <div className={styles.cover} />
          </div>
        </div>
        <table cellPadding='12px' className={styles.table}>
          <thead className={styles.tableHeader}>
            <td>Name</td>
            <td>Health</td>
            <td>Points</td>
          </thead>
          <tbody className={styles.tablebody}>
            {playersList.map((player, i) => {
              const body = bodies.get(player.bodyId);
              const follow = controlState.target && controlState.target.id === player.bodyId;
              return (
                <tr
                  style={{ color: follow ? '#58d661' : '#fff', cursor: 'pointer' }}
                  key={i}
                  onClick={() => this.followPlayer(player.id)}
                >
                  <td className={styles.nickname}>{player.name}</td>
                  {/* Skull Symbol */}
                  <td>{body ? body.health : String.fromCodePoint(0x1f480)}</td>
                  <td>{player.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  private followPlayer(id: number) {
    const {
      observer: { players, bodies, control: controlState },
    } = this.props;

    const player = players.get(id);
    if (!player) {
      return;
    }

    const body = bodies.get(player.bodyId);
    if (!body) {
      return;
    }

    control.setTarget(controlState, body);
  }
}

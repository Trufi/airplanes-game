import * as React from 'react';
import { ObserverState } from '../observer/types';
import { mapToArray } from '../../utils';
import * as control from '../observer/control';

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

    this.state = {
      x: 0,
      y: 30,
    };
  }
  public render() {
    const { x, y } = this.state;
    const {
      observer: { players, bodies, control: controlState },
    } = this.props;

    const playersList = mapToArray(players);
    playersList.sort((a, b) => b.points - a.points);

    return (
      <div
        style={{
          position: 'absolute',
          top: `${y}px`,
          left: `${x}px`,
        }}
      >
        <table>
          <thead>
            <tr>
              <td>Name</td>
              <td>Health</td>
              <td>Points</td>
            </tr>
          </thead>
          <tbody>
            {playersList.map((player, i) => {
              const body = bodies.get(player.bodyId);
              const follow = controlState.target && controlState.target.id === player.bodyId;
              return (
                <tr
                  style={{ background: follow ? '#ff0000' : 'none' }}
                  key={i}
                  onClick={() => this.followPlayer(player.id)}
                >
                  <td>{player.name}</td>
                  <td>{body ? body.health : 'dead'}</td>
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

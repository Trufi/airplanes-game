import * as React from 'react';
import { State as GameState } from '../types';
import { mapMap } from '../../utils';

interface Props {
  style: React.CSSProperties;
  state: GameState;
}

interface State {
  show: boolean;
}

export class Debug extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  public render() {
    const { style, state: gameState } = this.props;
    const { players, game, bodies, serverTime } = gameState;

    if (!this.state.show) {
      return (
        <div style={style}>
          <button onClick={this.toggle}>Debug</button>
        </div>
      );
    }

    return (
      <div style={style}>
        <button onClick={this.toggle}>Debug</button>
        {game && (
          <div style={{ marginBottom: '15px', fontWeight: 700 }}>
            <div>
              You ID: {game.id} NAME: {game.name}
            </div>
          </div>
        )}
        <div>Ping: {serverTime.ping}</div>
        <div>Time diff: {serverTime.diff}</div>
        <div style={{ fontWeight: 700 }}>Other players:</div>
        <table>
          <thead>
            <tr>
              <td>ID</td>
              <td>Name</td>
              <td>Health</td>
            </tr>
          </thead>
          <tbody>
            {mapMap(players, ({ id, name, bodyId }) => {
              const body = bodies.get(bodyId);
              return (
                <tr>
                  <td>{id}</td>
                  <td>{name}</td>
                  <td>{body ? body.health : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  private toggle = () => {
    this.setState({ show: !this.state.show });
  };
}
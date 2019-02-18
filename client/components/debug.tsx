import * as React from 'react';
import { State as GameState } from '../types';
import { mapMap, quatToEuler } from '../utils';

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
    const { players, session, bodies } = gameState;

    if (!this.state.show) {
      return (
        <div style={style}>
          <button onClick={this.toggle}>Debug</button>
        </div>
      );
    }

    const euler = session && quatToEuler(session.body.rotation);

    return (
      <div style={style}>
        <button onClick={this.toggle}>Debug</button>
        {euler && session && (
          <div style={{ marginBottom: '15px', fontWeight: 700 }}>
            <div>
              You ID: {session.id} NAME: {session.name}
            </div>
            <div>Roll: {euler.roll}</div>
            <div>Pitch: {euler.pitch}</div>
            <div>Yaw: {euler.yaw}</div>
          </div>
        )}
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

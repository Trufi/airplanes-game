import * as React from 'react';
import { State as GameState } from '../types';
import { mapMap } from '../../utils';
import { ObserverState } from '../observer/types';

interface Props {
  style: React.CSSProperties;
  state: GameState | ObserverState;
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
    const { players, bodies, serverTime } = gameState;

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
        {gameState.type === 'game' && (
          <div style={{ marginBottom: '15px', fontWeight: 700 }}>
            <div>
              You ID: {gameState.player.id} NAME: {gameState.player.name}
            </div>
          </div>
        )}
        <div>Ping: {serverTime.ping}</div>
        <div>Time diff: {serverTime.diff}</div>
        <div>MS: {gameState.time - gameState.prevTime}</div>
        <div>FPS: {Math.round(1000 / (gameState.time - gameState.prevTime))}</div>
        <div style={{ fontWeight: 700 }}>Other players:</div>
        <table>
          <thead>
            <tr>
              <td>ID</td>
              <td>Name</td>
              <td>Health</td>
              <td>Kills</td>
              <td>Deaths</td>
              <td>Points</td>
            </tr>
          </thead>
          <tbody>
            {mapMap(players, ({ id, name, bodyId, kills, deaths, points }, i) => {
              const body = bodies.get(bodyId);
              return (
                <tr key={i}>
                  <td>{id}</td>
                  <td>{name}</td>
                  <td>{body ? body.health : 'dead'}</td>
                  <td>{kills}</td>
                  <td>{deaths}</td>
                  <td>{points}</td>
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

import * as React from 'react';
import { State } from '../types';
import { PlayerLabel } from './playerLabel';
import { Debug } from './debug';
import { Aim } from './aim';
import { FireButton } from './fireButton';
import { ExecuteCmd } from '..';
import { Login } from './login';
import { GameSelect } from './gameSelect';
import { DeathNotes } from './deathNotes';
import { Stick } from './stick';

interface Props {
  state: State;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();
const position = new THREE.Vector3();

export class Root extends React.Component<Props, any> {
  public render() {
    const {
      state: { game, name, gameList },
      executeCmd,
    } = this.props;

    if (game) {
      return this.renderGame();
    }

    if (!name) {
      return <Login executeCmd={executeCmd} />;
    }

    if (gameList) {
      return <GameSelect gameList={gameList} executeCmd={executeCmd} />;
    }
  }

  private renderGame() {
    const {
      state: { players, bodies, camera, game },
    } = this.props;

    const playerNames: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const body = bodies.get(bodyId);
      if (!body) {
        return;
      }

      position.fromArray(body.position);

      if (!frustum.containsPoint(position)) {
        return;
      }

      playerNames.push(
        <PlayerLabel
          key={id}
          name={name}
          position={body.position}
          camera={camera}
          health={body.health}
        />,
      );
    });

    return (
      <div>
        <DeathNotes state={this.props.state} />
        <Debug
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          state={this.props.state}
        />
        {playerNames}
        {game && (
          <Aim position={game.body.position} rotation={game.body.rotation} camera={camera} />
        )}
        <FireButton state={this.props.state} />
        <Stick state={this.props.state} />
      </div>
    );
  }
}

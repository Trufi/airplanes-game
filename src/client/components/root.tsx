import * as React from 'react';
import * as THREE from 'three';
import { AppState, State } from '../types';
import { PlayerLabel } from './playerLabel';
import { Debug } from './debug';
import { Aim } from './aim';
import { FireButton } from './fireButton';
import { Login } from './login';
import { GameSelect } from './gameSelect';
import { DeathNotes } from './deathNotes';
import { Stick } from './stick';
import { ExecuteCmd } from '../commands/execute';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();
const position = new THREE.Vector3();

export class Root extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { game, name, gameList },
      executeCmd,
    } = this.props;

    if (game) {
      return this.renderGame(game);
    }

    if (!name) {
      return <Login executeCmd={executeCmd} />;
    }

    if (gameList) {
      return <GameSelect gameList={gameList} executeCmd={executeCmd} />;
    }
  }

  private renderGame(game: State) {
    const { players, bodies, camera, body } = game;

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
        <DeathNotes state={game} />
        <Debug
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 400,
          }}
          state={game}
        />
        {playerNames}
        {game && <Aim position={body.position} rotation={body.rotation} camera={camera} />}
        <FireButton state={game} />
        <Stick state={game} />
      </div>
    );
  }
}

import * as React from 'react';
import * as THREE from 'three';
import { AppState, State } from '../types';
import { PlayerLabel } from './playerLabel';
import { Debug } from './debug';
import { Aim } from './aim';
import { FireButton } from './fireButton';
import { DeathNotes } from './deathNotes';
import { Stick } from './stick';
import { ExecuteCmd, executeCmd } from '../commands/execute';
import { cmd } from '../commands';
import { msg } from '../messages';
import { Arrow } from './arrow';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();

export class Game extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { game },
    } = this.props;

    if (!game) {
      return;
    }

    const { players, bodies, camera, body } = game;

    const playerNames: JSX.Element[] = [];
    const playerArrows: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const targetBody = bodies.get(bodyId);

      // Не показываем подпись на своим самолетом
      if (!targetBody || targetBody === body) {
        return;
      }

      playerArrows.push(
        <Arrow key={id} position={targetBody.position} camera={camera} frustum={frustum} />,
      );

      playerNames.push(
        <PlayerLabel
          key={id}
          name={name}
          position={targetBody.position}
          camera={camera}
          health={targetBody.health}
          frustum={frustum}
        />,
      );
    });

    return (
      <div>
        <DeathNotes state={game} />
        {playerNames}
        {playerArrows}
        {body ? this.renderLiveComponents(game) : this.renderDeath()}
      </div>
    );
  }

  private renderLiveComponents(game: State) {
    return (
      <>
        <Aim />
        <FireButton state={game} />
        <Stick state={game} />
        <Debug
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 400,
          }}
          state={game}
        />
      </>
    );
  }

  private renderDeath() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          zIndex: 100,
        }}
      >
        <div>ПОТРАЧЕНО!</div>
        <button onClick={this.restart}>Restart</button>
      </div>
    );
  }

  private restart = () => {
    executeCmd(cmd.sendMsg(msg.restart()));
  };
}

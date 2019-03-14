import * as React from 'react';
import * as THREE from 'three';
import { AppState } from '../types';
import { PlayerLabel } from './playerLabel';
import { DeathNotes } from './deathNotes';
import { ExecuteCmd } from '../commands/execute';
import { Debug } from './debug';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();

export class Observer extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { observer },
    } = this.props;

    if (!observer) {
      return;
    }

    const { players, bodies, camera } = observer;

    const playerNames: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(
      camera.object.projectionMatrix,
      camera.object.matrixWorldInverse,
    );
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const targetBody = bodies.get(bodyId);

      // Не показываем подпись на своим самолетом
      if (!targetBody) {
        return;
      }

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
      <div
        style={{
          // https://developers.google.com/web/updates/2017/01/scrolling-intervention
          touchAction: 'none',
        }}
      >
        <DeathNotes state={observer} />
        <div>{playerNames}</div>
        <Debug
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 400,
          }}
          state={observer}
        />
      </div>
    );
  }
}

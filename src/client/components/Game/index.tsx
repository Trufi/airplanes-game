import * as React from 'react';
import * as THREE from 'three';
import { AppState, State, PhysicBodyState } from '../../types';
import { PlayerLabel } from '../playerLabel';
import { Debug } from '../debug';
import { Aim } from '../aim';
import { FireButton } from '../FireButton';
import { DeathNotes } from '../deathNotes';
import { Stick } from '../stick';
import { ExecuteCmd, executeCmd } from '../../commands/execute';
import { cmd } from '../../commands';
import { msg } from '../../messages/index';
import { Arrow } from '../arrow';
import { GameStats } from '../gameStats';
import { Health } from '../health';
import { BoostButton } from '../BoostButton';
import { ShotBlink } from '../shotBlink/shotBlink';
import { DamageIndicator } from '../damageIndicator/damageIndicator';
import { Disconnect } from '../disconnect';
import styles from './index.css';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();

export class Game extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { game, connected },
    } = this.props;

    if (!game) {
      return;
    }

    if (!connected) {
      return <Disconnect />;
    }

    const { players, bodies, camera, body } = game;

    const playerNames: JSX.Element[] = [];
    const playerArrows: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(
      camera.object.projectionMatrix,
      camera.object.matrixWorldInverse,
    );
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
      <div
        style={{
          // https://developers.google.com/web/updates/2017/01/scrolling-intervention
          touchAction: 'none',
        }}
      >
        <DeathNotes state={game} />
        <div>{playerNames}</div>
        <div>{playerArrows}</div>
        {body ? this.renderLiveComponents(game, body) : this.renderDeath(game)}
      </div>
    );
  }

  private renderLiveComponents(game: State, body: PhysicBodyState) {
    return (
      <>
        <ShotBlink game={game} />
        <DamageIndicator game={game} />
        <Aim weapon={body.weapon} time={game.time} />
        <div className={styles.controllers}>
          <BoostButton game={game} />
          <FireButton game={game} />
        </div>
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
        <Health body={body} />
      </>
    );
  }

  private renderDeath(game: State) {
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
        <GameStats players={game.players} />
      </div>
    );
  }

  private restart = () => {
    executeCmd(cmd.sendMsg(msg.restart()));
  };
}

import * as React from 'react';
import { Login } from './login';
import { GameSelect } from './gameSelect';
import { ExecuteCmd } from '../commands/execute';
import { AppState } from '../types';
import { Game } from './game';
import { appState } from '../appState';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class Root extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { type, game, name, gameList },
      executeCmd,
    } = this.props;

    if (type === 'game' && game) {
      return <Game appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'login' && !name) {
      return <Login executeCmd={executeCmd} />;
    }

    if (type === 'gameSelect' && gameList) {
      return <GameSelect gameList={gameList} executeCmd={executeCmd} />;
    }
  }
}

import * as React from 'react';
import { Login } from './login';
import { GameSelect } from './gameSelect';
import { ExecuteCmd } from '../commands/execute';
import { AppState } from '../types';
import { Game } from './game';
import { appState } from '../appState';
import { Disconnect } from './disconnect';
import { Observer } from './observer';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class Root extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { type, game, name, connected, observer },
      executeCmd,
    } = this.props;

    if (!connected) {
      return <Disconnect />;
    }

    if (type === 'game' && game) {
      return <Game appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'observer' && observer) {
      return <Observer appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'login' && !name) {
      return <Login appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'gameSelect') {
      return <GameSelect appState={appState} executeCmd={executeCmd} />;
    }
  }
}

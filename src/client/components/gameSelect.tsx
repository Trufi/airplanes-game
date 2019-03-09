import * as React from 'react';
import { cmd } from '../commands';
import { msg } from '../messages';
import { ExecuteCmd } from '../commands/execute';
import { AppState } from '../types';
import { getList } from '../services/game';

interface State {
  gamelist: Array<{ id: number, players: number }>;
}

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class GameSelect extends React.Component<Props, State> {
  private state: State = {
    gamelist: [],
  };

  public componentDidMount() {
    const { appState } = this.props;
    if (appState.token) {
      getList({ token: appState.token })
        .then((data) => {
          this.setState({ gamelist: data.games });
        });
    }
  }

  public render() {
    const { gamelist } = this.state;

    return (
      <div
        style={{
          width: '300px',
          height: '100px',
          position: 'absolute',
          left: '50%',
          margin: '0 0 0 -150px',
        }}
      >
        {gamelist && gamelist.map(({ id }, i) => (
          <div
            key={i}
            style={{
              width: '300px',
              height: '70px',
              lineHeight: '70px',
              textAlign: 'center',
              verticalAlign: 'middle',
              border: '1px solid',
              margin: '0 0 10px 0',
              background: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => this.gameSelected(id)}
          >
            Game {id}
          </div>
        ))}
      </div>
    );
  }

  private gameSelected = (id: number) => {
    this.props.executeCmd(cmd.sendMsg(msg.joinGame(id)));
  };
}

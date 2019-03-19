import * as React from 'react';
import { cmd } from '../commands';
import { ExecuteCmd } from '../commands/execute';
import { AppState } from '../types';
import { getList } from '../services/game';

interface State {
  gamelist: Array<{ id: number; players: number; url: string }>;
}

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class GameSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gamelist: [],
    };
  }

  public componentDidMount() {
    const { appState } = this.props;
    if (appState.token) {
      getList({ token: appState.token }).then((data) => {
        this.setState({ gamelist: data });
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
        {gamelist &&
          gamelist.map(({ id, url }, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
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
              onClick={() => this.gameSelected(id, url)}
            >
              Game {id}
              <div
                style={{
                  position: 'absolute',
                  right: '-50px',
                  top: 0,
                  border: '1px solid',
                  color: '#0000ff',
                }}
                onClick={(ev) => this.gameObserve(ev, id, url)}
              >
                obs
              </div>
            </div>
          ))}
      </div>
    );
  }

  private gameSelected = (id: number, url: string) => {
    this.props.executeCmd(cmd.connectToGameServer(url));

    this.props.appState.tryJoin = {
      id,
      url,
      type: 'player',
    };
  };

  private gameObserve = (ev: React.MouseEvent, id: number, url: string) => {
    ev.stopPropagation();
    this.props.executeCmd(cmd.connectToGameServer(url));

    this.props.appState.tryJoin = {
      id,
      url,
      type: 'observer',
    };
  };
}

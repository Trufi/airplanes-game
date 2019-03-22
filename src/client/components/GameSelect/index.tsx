import * as React from 'react';
import { cmd } from '../../commands';
import { ExecuteCmd } from '../../commands/execute';
import { AppState } from '../../types';
import { getList } from '../../services/game';
import styles from './index.css';

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
      <div className={styles.container}>
        <div className={styles.list}>
          {gamelist &&
            gamelist.map(({ id, url }, i) => (
              <div key={i} className={styles.gameItem} onClick={() => this.gameSelected(id, url)}>
                <div className={styles.itemRounded}>
                  <div>Game</div>
                  <div>{id}</div>
                </div>
                <div className={styles.obsLink} onClick={(ev) => this.gameObserve(ev, id, url)}>
                  Observer
                </div>
              </div>
            ))}
        </div>
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

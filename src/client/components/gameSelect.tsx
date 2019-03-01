import * as React from 'react';
import { ExecuteCmd } from '..';
import { cmd } from '../commands';
import { msg } from '../messages';

interface Props {
  gameList: Array<{ id: number }>;
  executeCmd: ExecuteCmd;
}

export class GameSelect extends React.Component<Props, {}> {
  public render() {
    const { gameList } = this.props;

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
        {gameList.map(({ id }, i) => (
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

import * as React from 'react';
import { ExecuteCmd } from '..';
import { cmd } from '../commands';
import { msg } from '../messages';

interface Props {
  executeCmd: ExecuteCmd;
}

export class Login extends React.Component<Props, {}> {
  private inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.inputRef = React.createRef();
  }
  public render() {
    return (
      <div
        style={{
          width: '200px',
          height: '100px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          margin: '-50px 0 0 -100px',
        }}
      >
        <h3>Login</h3>
        <input ref={this.inputRef} type='text' onKeyPress={this.onKeyPress} />
        <button onClick={this.submit}>Start</button>
      </div>
    );
  }

  private submit = () => {
    const input = this.inputRef.current;
    if (!input) {
      return;
    }

    const value = input.value;

    if (value.length > 3) {
      this.props.executeCmd(cmd.sendMsg(msg.login(value)));
    }
  };

  private onKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      this.submit();
    }
  };
}

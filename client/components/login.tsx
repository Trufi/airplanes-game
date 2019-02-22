import * as React from 'react';
import { ExecuteCmd } from '..';
import { cmd } from '../commands';
import { msg } from '../messages';

interface Props {
  executeCmd: ExecuteCmd;
}

export class Login extends React.Component<Props, any> {
  private inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.inputRef = React.createRef();
  }
  public render() {
    return (
      <div>
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
      this.props.executeCmd(cmd.sendMsg(msg.start(value)));
    }
  };

  private onKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      this.submit();
    }
  };
}

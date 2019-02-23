import * as React from 'react';
import { State } from '../types';

interface Props {
  state: State;
}

export class FireButton extends React.Component<Props, any> {
  public render() {
    return (
      <div
        style={{
          position: 'absolute',
          right: '60px',
          bottom: 0,
          display: 'inline-block',
          width: '50px',
          height: '50px',
          background: '#fff',
          border: '1px solid',
          textAlign: 'center',
          lineHeight: '50px',
          fontSize: '30px',
          userSelect: 'none',
        }}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
      >
        Fire
      </div>
    );
  }

  private onTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.state.pressedKeys['Space'] = true;
  };

  private onTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.props.state.pressedKeys['Space'] = false;
  };
}

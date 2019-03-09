import * as React from 'react';

export class Disconnect extends React.Component<{}, {}> {
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
        Disconnect <br />
        <button onClick={this.reload}>Reload</button>
      </div>
    );
  }

  private reload = () => {
    location.reload();
  };
}

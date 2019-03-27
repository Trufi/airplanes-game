import * as React from 'react';
import styles from './index.css';

interface Props {
  withTimer?: boolean;
  timeFinish?: () => void;
}

interface State {
  tick: number;
}

export class RadarLoader extends React.Component<Props, State> {
  public state = {
    tick: 9,
  };
  private timer: any = 0;

  public componentDidMount() {
    if (this.props.withTimer) {
      this.timer = setInterval(() => {
        this.setState({
          tick: this.state.tick - 1,
        });
      }, 1000);
    }
  }

  public componentWillUnmount() {
    if (this.props.withTimer) {
      this.stopTimer();
    }
  }

  public stopTimer() {
    clearInterval(this.timer);
    if (this.props.timeFinish) {
      this.props.timeFinish();
    }
  }

  public render() {
    const { withTimer } = this.props;
    const { tick } = this.state;

    if (withTimer && tick === 0) {
      this.stopTimer();
    }
    return (
      <div className={styles.counter}>
        <div className={styles.pointer} />
        <div className={styles.shadow} />
        {withTimer && <div>{tick !== 0 && tick}</div>}
      </div>
    );
  }
}

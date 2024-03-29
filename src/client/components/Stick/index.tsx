import * as React from 'react';
import * as vec2 from '@2gis/gl-matrix/vec2';
import { State } from '../../types';
import styles from './index.css';

interface Props {
  state: State;
}

interface ComponentState {
  enabled: boolean;
  shiftX: number;
  shiftY: number;
  originX: number;
  originY: number;
  radius: number;
  buttonRadius: number;
}

export class Stick extends React.Component<Props, ComponentState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      enabled: false,
      shiftX: 0,
      shiftY: 0,
      originX: 0,
      originY: 0,
      radius: 53,
      buttonRadius: 28,
    };
  }
  public render() {
    const { enabled } = this.state;

    return (
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          zIndex: 300,
          width: `${window.innerWidth / 2}px`,
          height: `${window.innerHeight}px`,
        }}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
      >
        {enabled && this.renderControl()}
      </div>
    );
  }

  private onTouchStart = (ev: React.TouchEvent) => {
    ev.preventDefault();
    const touch = ev.targetTouches[0];
    if (!touch) {
      return;
    }

    this.setState({
      ...this.state,
      enabled: true,
      shiftX: 0,
      shiftY: 0,
      originX: touch.clientX,
      originY: touch.clientY,
    });
  };

  private onTouchEnd = (ev: React.TouchEvent) => {
    ev.preventDefault();
    this.setState({
      ...this.state,
      enabled: false,
    });

    this.props.state.stick.x = 0;
    this.props.state.stick.y = 0;
  };

  private onTouchMove = (ev: React.TouchEvent) => {
    ev.preventDefault();
    const touch = ev.targetTouches[0];
    if (!touch) {
      return;
    }

    const { originX, originY, radius, enabled } = this.state;
    if (!enabled) {
      return;
    }
    const direction = [touch.clientX - originX, originY - touch.clientY];

    const length = vec2.len(direction);

    if (length > radius) {
      vec2.scale(direction, direction, radius / length);
    }

    const shiftX = direction[0];
    const shiftY = direction[1];

    this.setState({
      ...this.state,
      shiftX,
      shiftY,
    });

    const log = (x: number) => Math.sign(x) * x * x;
    this.props.state.stick.x = log(shiftX / radius);
    this.props.state.stick.y = log(shiftY / radius);
  };

  private renderControl(): JSX.Element {
    const { originX, originY, radius, buttonRadius, shiftX, shiftY } = this.state;

    return (
      <div
        className={styles.controlWrapper}
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: `${originY - radius}px`,
          left: `${originX - radius}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          borderRadius: `${radius}px`,
        }}
      >
        <div
          className={styles.controlStick}
          style={{
            position: 'absolute',
            top: `${radius - buttonRadius - shiftY}px`,
            left: `${radius - buttonRadius + shiftX}px`,
            width: `${buttonRadius * 2}px`,
            height: `${buttonRadius * 2}px`,
            borderRadius: `${buttonRadius}px`,
          }}
        />
      </div>
    );
  }
}

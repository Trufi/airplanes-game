import * as React from 'react';
import styles from './index.css';

const DIAMETR = 18;
const STROKE_WIDTH = 3;

interface Props {
  percentage: number;
  strokeWidth: number;
  diametr: number;
}

export class HeatCircle extends React.Component<Props, {}> {
  public getRainbowColor(percentage: any) {
    const minColor = [222, 194, 176];
    const maxColor = [218, 53, 0];
    const coefficient = percentage / 100;

    const red = this.difference(minColor[0], maxColor[0], coefficient);
    const blue = this.difference(minColor[1], maxColor[1], coefficient);
    const green = this.difference(minColor[2], maxColor[2], coefficient);

    return { red, blue, green };
  }

  public difference(min: any, max: any, coefficient: any) {
    return Math.round(min + coefficient * (max - min));
  }

  public render() {
    const { percentage, strokeWidth = STROKE_WIDTH, diametr = DIAMETR } = this.props;

    const radius = (diametr - strokeWidth) / 2;
    const center = diametr / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeFill = (circumference * percentage) / 100;

    const color = this.getRainbowColor(percentage);
    const dashArray = `${strokeFill} ${circumference - strokeFill}`;
    const strokeColor = `rgb(${color.red},${color.blue},${color.green})`;

    return (
      <div className={styles.circle}>
        <svg
          className={styles.svg}
          xmlns='http://www.w3.org/2000/svg'
          width={diametr}
          height={diametr}
          version='1.1'
        >
          <circle
            stroke='#d4d3cc59'
            strokeWidth={strokeWidth}
            cx={center}
            cy={center}
            r={radius}
            fill='none'
          />
          <circle
            stroke={strokeColor}
            strokeDashoffset={circumference / 4}
            strokeDasharray={dashArray}
            strokeWidth={strokeWidth}
            cx={center}
            cy={center}
            r={radius}
            fill='none'
          />
        </svg>
      </div>
    );
  }
}

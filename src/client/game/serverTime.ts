import { time, median } from '../utils';
import { ServerMsg } from '../../server/messages';

export const createServerTimeState = () => ({
  diffSample: [] as number[],
  diff: 0,

  pingSample: [] as number[],
  ping: 300,
});

export type ServerTimeState = ReturnType<typeof createServerTimeState>;

export const updatePingAndServerTime = (timeState: ServerTimeState, msg: ServerMsg['pong']) => {
  const { pingSample, diffSample } = timeState;
  const maxSampleLength = 10;

  const ping = time() - msg.clientTime;
  pingSample.push(ping);
  if (pingSample.length > maxSampleLength) {
    pingSample.shift();
  }

  timeState.ping = median(pingSample);

  const diff = msg.clientTime + ping / 2 - msg.serverTime;
  diffSample.push(diff);
  if (diffSample.length > maxSampleLength) {
    diffSample.shift();
  }

  timeState.diff = median(diffSample);
};

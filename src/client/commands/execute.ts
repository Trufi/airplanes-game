import { Cmd, ExistCmd } from '.';
import { renderUI } from '../ui';
import { connect, sendMessage, sendPbfMessage } from '../socket';
import { appState } from '../appState';

export type ExecuteCmd = typeof executeCmd;

export const executeCmd = (cmd: Cmd) => {
  if (cmd) {
    if (Array.isArray(cmd)) {
      cmd.forEach(executeOneCmd);
    } else {
      executeOneCmd(cmd);
    }
  }
};

const executeOneCmd = (cmd: ExistCmd) => {
  switch (cmd.type) {
    case 'connectToGameServer':
      connect(cmd.url);
      break;
    case 'sendMsg':
      sendMessage(cmd.msg);
      break;
    case 'sendPbfMsg':
      sendPbfMessage(cmd.msg);
      break;
    case 'renderUI':
      renderUI(appState, executeCmd);
      break;
  }
};

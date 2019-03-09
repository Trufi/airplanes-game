import { AppState } from '../types';
import { AnyServerMsg, ServerMsg } from '../../server/messages';
import { Cmd, cmd } from '../commands';
import { message as gameMessage } from '../game/actions/message';
import { start } from '../game';

export const message = (appState: AppState, msg: AnyServerMsg): Cmd => {
  if (appState.type === 'game' && appState.game) {
    return gameMessage(appState.game, msg);
  }

  switch (msg.type) {
    case 'connect':
      return saveConnectId(appState, msg);
    case 'loginSuccess':
      return loginSuccess(appState, msg);
    case 'startData':
      return startData(appState, msg);
  }
};

const startData = (appState: AppState, msg: ServerMsg['startData']): Cmd => {
  appState.type = 'game';
  start(msg);
};

const saveConnectId = (appState: AppState, msg: ServerMsg['connect']): Cmd => {
  appState.id = msg.id;
};

const loginSuccess = (appState: AppState, msg: ServerMsg['loginSuccess']): Cmd => {
  appState.name = msg.name;
  appState.gameList = msg.game;
  appState.type = 'gameSelect';
  return [cmd.renderUI(), cmd.saveNameToLocalStorage(msg.name)];
};

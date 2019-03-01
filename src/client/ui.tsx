import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppState } from './types';
import { Root } from './components/root';
import { ExecuteCmd } from './commands/execute';

export const renderUI = (appState: AppState, executeCmd: ExecuteCmd) => {
  ReactDOM.render(
    <Root appState={appState} executeCmd={executeCmd} />,
    document.getElementById('root'),
  );
};

import './socket';
import { appState } from './appState';
import { renderUI } from './ui';
import { executeCmd } from './commands/execute';

import(/* webpackPrefetch: true */ 'three-gltf-loader');
import(/* webpackPrefetch: true */ '@2gis/jakarta');

renderUI(appState, executeCmd);

const fullscreenButton = document.getElementById('fullscreen') as HTMLElement;
fullscreenButton.addEventListener('click', () => {
  document.body.requestFullscreen();
});
fullscreenButton.addEventListener('touchmove', (ev) => ev.preventDefault());

const resize = () => {
  document.body.style.width = `${window.innerWidth}px`;
  document.body.style.height = `${window.innerHeight}px`;
};
window.addEventListener('resize', resize);
resize();

/**
 * Расскоментируй это 👇, если хочешь входить без регистрации и смс
 */
// appState.type = 'gameSelect';
// appState.name = 'Anon';
// appState.token = '123';
// appState.tryJoin = {
//   id: 1,
//   type: 'bot',
//   url: 'localhost:3001',
// };
// executeCmd(cmd.renderUI());
// executeCmd(cmd.connectToGameServer('localhost:3001'));

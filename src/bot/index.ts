import { initBot } from './bot';

// const serverUrl = `ws://localhost:3001`;
const serverUrl = `wss://sky-game-nsk.web-staging.2gis.ru`;

const botNumber = 30;

for (let i = 0; i < botNumber; i++) {
  const name = `Bot ${i}`;
  initBot(serverUrl, name, -1 - i);
}

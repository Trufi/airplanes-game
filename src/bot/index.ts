import { initBot } from './bot';

// const serverUrl = `ws://localhost:3001`;
const serverUrl = `wss://sky.2gis.ru/city/nsk`;

const botNumber = 30;

for (let i = 0; i < botNumber; i++) {
  const name = `Bot ${i}`;
  initBot(serverUrl, name, -1 - i);
}

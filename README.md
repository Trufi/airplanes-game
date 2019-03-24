# Запуск игры

1. npm install
2. npm run server — поднимается главный сервак на 3002 порту
3. npm run game — поднимается игровой сервер на 3001 порту
4. npm run dev — поднимает dev-сервер с клиентским кодом на 3000 порту
5. Открыть http://localhost:3000

⚠️ Чтобы клиентский код или поднятые локальные серверы не ходили на бой, можно переопределить URL до серверов с помощью создания файла `.env`.

Например, для переоепределения URL игрового сервера:

```
GAME_SERVER_URL=localhost:3001
```

Для переопределение URL до главного сервера

```
MAIN_SERVER_URL=http://localhost:3002
```

# URLs

Чтобы зайти как обсервер, нужно в URL добавить GET-параметр `?observer`, например, https://sky.2gis.ru?observer

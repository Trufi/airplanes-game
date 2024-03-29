import { Request, Response } from 'express';

const allowedOrigins = [
  'http://10.54.6.172:3000',
  'http://10.54.6.172:3001',
  'http://10.54.6.172:3002',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3002',
  'http://demo.webmaps-dev.os-n3.hw:3002',
  'http://demo.webmaps-dev.os-n3.hw:3001',
  'http://demo.webmaps-dev.os-n3.hw:3000',
];

export const setAccessAllowOrigin = (req: Request, res: Response) => {
  // В заголовок Access-Control-Allow-Origin можно передовать только строку и только 1 домен.
  // Делаем динамический 'Access-Control-Allow-Origin' как аналог в .htaccess
  // У нас есть ряд одобренных Origins, поэтому если текущий Origin есть в списке,
  // то мы устанавливаем его.
  // Достаем текущий origin из заголовока Origin текущего запроса, с которого нам шлют запрос.
  const reqOrigin = req.get('Origin');

  const allowOrigin = reqOrigin;

  // @TODO: раскомментить строку ниже для production мода
  // const allowOrigin = allowedOrigins.find((origin) => origin === reqOrigin);

  // Заголовок ответа Access-Control-Allow-Headers используется в ответ на preflight reques
  // (обычно это OPTIONS), чтобы указать, какие заголовки HTTP могут использоваться во время
  // фактического запроса.
  if (req.method === 'OPTIONS') {
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With,' +
        'Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
  }

  // Разрешаем запросы для ресурсов из Origin.
  res.setHeader('Access-Control-Allow-Origin', allowOrigin ? allowOrigin : allowedOrigins[0]);
  // Разрешаем ответ на запрос (Т.к. credentials flag выставлен в true.)
  res.setHeader('Access-Control-Allow-Credentials', `${!!allowOrigin}`);
};

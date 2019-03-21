export const services = {
  apiDomain: `${location.protocol}//${location.host}`,
};

// Если дев сборка, то порт будет 3000, а сервак смотрит на 3002
if (location.port === '3000') {
  services.apiDomain = services.apiDomain.replace('3000', '3002');
}

const host = window.location.hostname;

export const environment = {
  production: true,
  apiUrl: '/api',
  brokerURL: `ws://${host}:8080/ws`,
};

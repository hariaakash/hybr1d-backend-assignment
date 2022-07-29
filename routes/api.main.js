const RouterHooks = require('../utils/hooks.router');

const publicRoutes = [];

const authorizedRoutes = [];

module.exports = [
  ...publicRoutes.map((x) => ({
    ...x,
    authorization: false,
    mappingPolicy: 'restrict',
    ...RouterHooks,
    bodyParsers: {
      json: true,
    },
  })),
  ...authorizedRoutes.map((x) => ({
    ...x,
    authorization: true,
    mappingPolicy: 'restrict',
    ...RouterHooks,
    bodyParsers: {
      json: true,
    },
  })),
];

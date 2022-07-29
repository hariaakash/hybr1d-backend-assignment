const RouterHooks = require('../utils/hooks.router');

const publicRoutes = [
  {
    path: '/public',
    aliases: {
      'POST /create': 'apiMain.user-create',
      'POST /login': 'apiMain.user-login',
    },
  },
];

const authorizedRoutes = [
  {
    path: '/user',
    aliases: {
      'GET /': 'apiMain.user-me',
      'DELETE /': 'apiMain.user-logout',
    },
  },
  {
    path: '/seller',
    aliases: {
      'POST /product': 'apiMain.product-create',
      'GET /product': 'apiMain.product-list',
    },
  },
];

const commonConfig = {
  mappingPolicy: 'restrict',
  ...RouterHooks,
  bodyParsers: {
    json: true,
  },
};

module.exports = [
  ...publicRoutes.map((x) => ({
    ...x,
    ...commonConfig,
    authorization: false,
  })),
  ...authorizedRoutes.map((x) => ({
    ...x,
    ...commonConfig,
    authorization: true,
  })),
];

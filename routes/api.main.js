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
      'GET /order': 'apiMain.order-bySeller',
    },
  },
  {
    path: '/buyer',
    aliases: {
      'GET /seller': 'apiMain.seller-list',
      'GET /seller/:seller': 'apiMain.product-bySeller',
      'POST /order/:seller': 'apiMain.order-create',
      'GET /order': 'apiMain.order-byBuyer',
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

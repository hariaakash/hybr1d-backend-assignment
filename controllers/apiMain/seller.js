const _ = require('lodash');

module.exports = {
  actions: {
    'seller-list': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.role = 'seller';
        const data = await ctx.call('user.paginatedList', { ...ctx.params, query });

        data.rows = data.rows.map((x) => ({ ..._.pick(x, ['_id', 'email']) }));

        return data;
      },
    },
    'seller-products': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.user = ctx.params.sellerId;
        return ctx.call('product.paginatedList', { ...ctx.params, query });
      },
    },
  },
};

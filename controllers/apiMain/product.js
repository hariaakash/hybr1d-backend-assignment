const Joi = require('joi');
const async = require('async');

module.exports = {
  actions: {
    'product-create': {
      params: () => Joi.object().keys({
        products: Joi.array().items(
          Joi.object().keys({
            name: Joi.string().required(),
            price: Joi.number().greater(0).required(),
          }),
        ).required(),
      }),
      async handler(ctx) {
        const failed = [];
        await async.each(ctx.params.products, async (product) => {
          try {
            await ctx.call('product.create', { ...product, user: String(ctx.meta.user._id) });
          } catch (err) {
            failed.push(product);
          }
        });
        return { message: 'Products created', failed };
      },
    },
    'product-list': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.user = String(ctx.meta.user._id);
        return ctx.call('product.paginatedList', { ...ctx.params, query });
      },
    },
  },
};

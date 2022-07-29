const Joi = require('joi');
const { MoleculerClientError } = require('moleculer').Errors;

const { JOI_ID } = require('../../utils/joi.schema');

module.exports = {
  actions: {
    'order-create': {
      params: () => Joi.object().keys({
        products: Joi.array().items(
          Joi.object().keys({
            product: JOI_ID.required(),
            qty: Joi.number().greater(0).required(),
          }),
        ).required(),
        seller: JOI_ID.required(),
      }),
      async handler(ctx) {
        // Check Products
        const products = await ctx.call('product.getByIds', { ids: ctx.params.products.map((x) => x.product), seller: ctx.params.seller });

        // Transform items
        const items = ctx.params.products.map((x) => {
          const product = products.find((y) => String(y._id) === x.product);
          if (!product) throw new MoleculerClientError('Product not found', 404, 'NOT_FOUND', { product: x.product });

          return {
            product: x.product,
            qty: x.qty,
            price: product.price,
            total: product.price * x.qty,
          };
        });

        // Create order
        const order = await ctx.call('order.create', {
          products: items,
          buyer: String(ctx.meta.user._id),
          seller: ctx.params.seller,
        });
        return { message: 'Order created', order };
      },
    },
    'order-byBuyer': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.buyer = String(ctx.meta.user._id);
        return ctx.call('order.paginatedList', { ...ctx.params, query });
      },
    },
    'order-bySeller': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.seller = String(ctx.meta.user._id);
        return ctx.call('order.paginatedList', { ...ctx.params, query });
      },
    },
  },
};

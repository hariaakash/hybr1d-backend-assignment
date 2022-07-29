const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');
const { MoleculerError } = require('moleculer').Errors;

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/Order');
const { JOI_ID } = require('../utils/joi.schema');

module.exports = {
  name: 'order',
  mixins: [
    DbMixin(model),
  ],
  settings: {
    fields: ['_id', 'products', 'items', 'total', 'buyer', 'seller', 'createdAt', 'updatedAt'],
  },
  actions: {
    // Create order for list of items with a buyer and seller
    create: {
      params: () => Joi.object().keys({
        id: JOI_ID.default(() => String(mongoose.Types.ObjectId())),
        products: Joi.array().items(
          Joi.object().keys({
            product: JOI_ID.required(),
            price: Joi.number().greater(0).required(),
            qty: Joi.number().greater(0).required(),
            total: Joi.number().greater(0).required(),
          }),
        ).required(),
        buyer: JOI_ID.required(),
        seller: JOI_ID.required(),
      }),
      async handler(ctx) {
        return this.adapter.insert({
          _id: ctx.params.id,
          items: ctx.params.products.length,
          total: ctx.params.products.reduce((acc, x) => acc + x.total, 0),
          ...ctx.params,
        });
      },
    },
    // Get specific order
    get: {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
        buyer: JOI_ID,
        seller: JOI_ID,
      }),
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['buyer', 'seller']) };
        if (ctx.params.id) query._id = ctx.params.id;

        const entity = await this.adapter.model.findOne(query).lean();
        if (!entity) throw new MoleculerError('Order not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    // Get list of orders pagination style, with seller/buyer filter
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default(''),
        search: Joi.string().default(''),
        searchFields: Joi.string().default(''),
        query: Joi.object().keys({
          seller: JOI_ID,
          buyer: JOI_ID,
        }),
      }).min(1),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
  },
};

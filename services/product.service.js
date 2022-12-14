const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');
const { MoleculerError, MoleculerClientError } = require('moleculer').Errors;

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/Product');
const { JOI_ID } = require('../utils/joi.schema');

module.exports = {
  name: 'product',
  mixins: [
    DbMixin(model),
  ],
  settings: {
    fields: ['_id', 'name', 'price', 'seller', 'createdAt', 'updatedAt'],
  },
  actions: {
    // Create Product
    create: {
      params: () => Joi.object().keys({
        id: JOI_ID.default(() => String(mongoose.Types.ObjectId())),
        name: Joi.string().required(),
        price: Joi.number().greater(0).required(),
        seller: JOI_ID.required(),
      }),
      async handler(ctx) {
        const entity = await this.adapter.findOne({ ..._.pick(ctx.params, ['name', 'seller']) });
        if (entity) throw new MoleculerClientError('Product with name already exists', 422, 'CLIENT_VALIDATION');

        return this.adapter.insert({
          _id: ctx.params.id,
          ...ctx.params,
        });
      },
    },
    // Get specific product
    get: {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
        seller: JOI_ID,
      }),
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['seller']) };
        if (ctx.params.id) query._id = ctx.params.id;

        const entity = await this.adapter.model.findOne(query).lean();
        if (!entity) throw new MoleculerError('Product not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    // Get products with list of id
    getByIds: {
      params: () => Joi.object().keys({
        ids: Joi.array().items(JOI_ID).required(),
        seller: JOI_ID,
      }),
      async handler(ctx) {
        const query = { _id: { $in: ctx.params.ids }, ..._.pick(ctx.params, ['seller']) };

        const entity = await this.adapter.model.find(query);
        return entity;
      },
    },
    // Product list pagination style
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default(''),
        search: Joi.string().default(''),
        searchFields: Joi.string().default('name'),
        query: Joi.object().keys({
          seller: JOI_ID,
        }),
      }).min(1),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
  },
};

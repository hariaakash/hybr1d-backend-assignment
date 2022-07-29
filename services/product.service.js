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
    fields: ['_id', 'name', 'price', 'user', 'createdAt', 'updatedAt'],
  },
  actions: {
    create: {
      params: () => Joi.object().keys({
        id: JOI_ID.default(() => String(mongoose.Types.ObjectId())),
        name: Joi.string().required(),
        price: Joi.number().greater(0).required(),
        user: JOI_ID.required(),
      }),
      async handler(ctx) {
        const entity = await this.adapter.findOne({ ..._.pick(ctx.params, ['name', 'user']) });
        if (entity) throw new MoleculerClientError('Product with name already exists', 422, 'CLIENT_VALIDATION');

        return this.adapter.insert({
          _id: ctx.params.id,
          ...ctx.params,
        });
      },
    },
    get: {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
        user: JOI_ID,
      }),
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['user']) };
        if (ctx.params.id) query._id = ctx.params.id;

        const entity = await this.adapter.model.findOne(query).lean();
        if (!entity) throw new MoleculerError('Product not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default(''),
        search: Joi.string().default(''),
        searchFields: Joi.string().default('name'),
        query: Joi.object().keys({
          user: JOI_ID,
        }),
      }).min(1),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
  },
};

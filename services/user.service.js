const Joi = require('joi');
const _ = require('lodash');
const { MoleculerError, MoleculerClientError } = require('moleculer').Errors;

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/User');
const PasswordManager = require('../utils/password.manager');
const { JOI_ID } = require('../utils/joi.schema');

module.exports = {
  name: 'stock',
  mixins: [
    DbMixin(model),
  ],
  settings: {
    fields: ['_id', 'email', 'password', 'role', 'createdAt', 'updatedAt'],
  },
  hooks: {
    after: {
      create: ['filterParams'],
      login: ['filterParams'],
      get: ['filterParams'],
    },
  },
  actions: {
    create: {
      params: () => Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      }),
      async handler(ctx) {
        return this.adapter.insert({
          ...ctx.params,
          password: await PasswordManager.hash(ctx.params.password),
        });
      },
    },
    get: {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
        company: JOI_ID,
      }),
      async handler(ctx) {
        const query = { _id: ctx.params.id };
        if (ctx.params.company) query.companies = ctx.params.company;
        const entity = await this.adapter.findOne(query);
        if (!entity) throw new MoleculerError('User not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    login: {
      params: () => Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      }),
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['email']) };
        const entity = await this.adapter.findOne(query);
        if (!entity) throw new MoleculerError('User not found', 404, 'NOT_FOUND');

        if (ctx.params.password) {
          if (await PasswordManager.verify(entity.password, ctx.params.password)) return entity;
          throw new MoleculerClientError('Wrong Password', 422, 'CLIENT_VALIDATION');
        }

        return entity;
      },
    },
  },
  methods: {
    filterParams(ctx, res) {
      const exclude = ['password', '__v'];
      if (res.rows) res.rows = res.rows.map((x) => _.omit(x, exclude));
      else res = _.omit(res.toObject(), exclude);
      return res;
    },
  },
  async created() {
    // await this.actions.seed();
  },
};

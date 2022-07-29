const Joi = require('joi');
const _ = require('lodash');
const { MoleculerError, MoleculerClientError } = require('moleculer').Errors;

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/User');
const PasswordManager = require('../utils/password.manager');
const { JOI_ID } = require('../utils/joi.schema');

module.exports = {
  name: 'user',
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
      paginatedList: ['filterParams'],
    },
  },
  actions: {
    // Create user using email as unique field
    create: {
      params: () => Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('buyer', 'seller').required(),
      }),
      async handler(ctx) {
        const found = await this.adapter.findOne({ email: ctx.params.email });
        if (found) throw new MoleculerClientError('User with email already exists', 422, 'CLIENT_VALIDATION');

        return this.createUser(ctx.params);
      },
    },
    // Get specific user
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
    // Login user and throw error if email not found
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
    // List user pagination style, used for seller listing
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default(''),
        search: Joi.string().default(''),
        searchFields: Joi.string().default('email'),
        query: Joi.object().keys({
          role: Joi.string(),
        }),
      }).min(1),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
  },
  methods: {
    // Filter password from any get actions
    filterParams(ctx, res) {
      const exclude = ['password', '__v'];
      if (res.rows) res.rows = res.rows.map((x) => _.omit(x, exclude));
      else res = _.omit(res.toObject(), exclude);
      return res;
    },
    // Seed db with test data
    async seedDB() {
      try {
        const data = [
          {
            email: 'seller@gmail.com',
            password: 'haha1234',
            role: 'seller',
          },
          {
            email: 'buyer@gmail.com',
            password: 'haha1234',
            role: 'buyer',
          },
        ];
        await data.forEach(async (x) => {
          const found = await this.adapter.findOne({ email: x.email });
          if (!found) await this.createUser(x);
        });
      } catch (err) {
        console.log(err);
      }
    },
    async createUser(data) {
      data.password = await PasswordManager.hash(data.password);
      return this.adapter.insert({ ...data });
    },
  },
  async created() {
    await this.seedDB();
  },
};

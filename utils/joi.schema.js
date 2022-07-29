const Joi = require('joi');

const JOI_ID = Joi.string().alphanum().length(24).regex(new RegExp('^[0-9a-fA-F]{24}$'));

module.exports = {
  JOI_ID,
};

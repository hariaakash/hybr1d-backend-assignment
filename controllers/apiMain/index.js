const user = require('./user');
const product = require('./product');
const seller = require('./seller');
const order = require('./order');

module.exports = {
  mixins: [
    user,
    product,
    seller,
    order,
  ],
};

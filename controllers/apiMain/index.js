const user = require('./user');
const product = require('./product');
const seller = require('./seller');

module.exports = {
  mixins: [
    user,
    product,
    seller,
  ],
};

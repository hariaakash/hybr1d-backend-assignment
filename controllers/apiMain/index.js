const user = require('./user');
const product = require('./product');

module.exports = {
  mixins: [
    user,
    product,
  ],
};

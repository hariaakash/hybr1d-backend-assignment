const argon2 = require('argon2');

const verify = async (hashData, password) => argon2.verify(hashData, password);
const hash = async (password) => argon2.hash(password);

module.exports = {
  verify,
  hash,
};

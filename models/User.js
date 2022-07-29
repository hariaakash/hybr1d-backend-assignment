const { model, Schema } = require('mongoose');

const schema = new Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, enum: ['buyer', 'seller'] },
}, {
  timestamps: true,
});

module.exports = model('User', schema);

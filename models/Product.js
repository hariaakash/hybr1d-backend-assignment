const { model, Schema } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

schema.index({
  name: 1,
}, { unique: true });

module.exports = model('Product', schema);

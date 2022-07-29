const { model, Schema } = require('mongoose');

const schema = new Schema({
  products: [
    {
      _id: false,
      product: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  items: { type: Number, required: true },
  total: { type: Number, required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

schema.index({
  name: 1,
}, { unique: true });

module.exports = model('Order', schema);

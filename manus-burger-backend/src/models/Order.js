const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['recebido', 'preparando', 'enviado', 'entregue'], default: 'recebido' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
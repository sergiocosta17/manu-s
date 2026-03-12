const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ['hambúrguer', 'acompanhamento', 'bebida'], required: true }
});

module.exports = mongoose.model('Product', ProductSchema);
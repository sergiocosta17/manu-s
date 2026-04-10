const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index para buscar promoções ativas
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
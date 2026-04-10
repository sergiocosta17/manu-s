const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  promotionalPrice: {
    type: Number,
    default: null
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'],
    required: true
  },
  imageUrl: {
    type: String
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true });

// Index para queries por categoria e disponibilidade
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');

const cashbackRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['GLOBAL', 'CATEGORY', 'PRODUCT', 'FIRST_ORDER', 'MIN_VALUE'],
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  categories: [{
    type: String,
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT']
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxCashbackValue: {
    type: Number
  },
  expirationDays: {
    type: Number,
    default: 30
  },
  allowEarnOnCashbackPayment: {
    type: Boolean,
    default: false
  },
  allowEarnWithCoupon: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CashbackRule', cashbackRuleSchema);
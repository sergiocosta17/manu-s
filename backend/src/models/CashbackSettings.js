const mongoose = require('mongoose');

const cashbackSettingsSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true
  },
  defaultPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  minRedeemValue: {
    type: Number,
    default: 5
  },
  maxRedeemPercentage: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  maxRedeemValue: {
    type: Number
  },
  defaultExpirationDays: {
    type: Number,
    default: 30
  },
  displayMessage: {
    type: String,
    default: 'Ganhe cashback em todas as compras!'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CashbackSettings', cashbackSettingsSchema);
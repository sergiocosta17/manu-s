const mongoose = require('mongoose');

const cashbackRuleSchema = new mongoose.Schema({
  // Campos obrigatórios
  name: { type: String, required: true },
  type: { type: String, enum: ['GLOBAL', 'CATEGORY', 'PRODUCT', 'FIRST_ORDER', 'MIN_VALUE'], required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  
  // Campos descritivos
  description: { type: String },
  
  // Regras de aplicação
  categories: [{ type: String, enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'] }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  minOrderValue: { type: Number, default: 0 },
  maxCashbackValue: { type: Number },
  
  // Configurações de validade e expiração
  expirationDays: { type: Number, default: 30 },
  
  // Regras de elegibilidade
  allowEarnOnCashbackPayment: { type: Boolean, default: false },
  allowEarnWithCoupon: { type: Boolean, default: true },
  
  // Ordem e ativação
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CashbackRule', cashbackRuleSchema);
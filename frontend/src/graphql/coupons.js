// models/Coupon.js
const mongoose = require('mongoose');

// Schema de uso por usuário (sem _id)
const userUseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 1 },
  lastUsedAt: { type: Date, default: Date.now }
}, { _id: false });

// Schema de horário de funcionamento (sem _id)
const timeScheduleSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  daysOfWeek: [{
    type: String,
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  }]
}, { _id: false });

// Schema principal do cupom
const couponSchema = new mongoose.Schema({
  // Identificação básica
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  description: String,

  // Tipo e valor do desconto
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], required: true },
  discountValue: { type: Number, required: true, default: 0 },
  maxDiscountValue: Number,
  minOrderValue: { type: Number, default: 0 },

  // Produtos/categorias aplicáveis
  applicableCategories: [{
    type: String,
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT']
  }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Público-alvo
  customerType: { type: String, enum: ['ALL', 'NEW', 'EXISTING', 'SPECIFIC'], default: 'ALL' },
  specificCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Limites de uso
  maxTotalUses: { type: Number, default: null },
  maxUsesPerUser: { type: Number, default: 1 },
  totalUsedCount: { type: Number, default: 0 },
  userUses: [userUseSchema],

  // Regras de combinação
  allowWithCashback: { type: Boolean, default: true },
  allowStacking: { type: Boolean, default: false },

  // Datas de vigência e horário
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  hasNoEndDate: { type: Boolean, default: false },
  schedule: timeScheduleSchema,

  // Status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Índices para performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ 'userUses.user': 1 });

module.exports = mongoose.model('Coupon', couponSchema);
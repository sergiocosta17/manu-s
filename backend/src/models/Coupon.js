const mongoose = require('mongoose');

// Schema de horário (sem _id)
const timeScheduleSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  daysOfWeek: [{ 
    type: String, 
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] 
  }]
}, { _id: false });

// Schema de uso por usuário (sem _id)
const userUseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 0 },
  lastUsedAt: { type: Date }
}, { _id: false });

// Schema principal do cupom
const couponSchema = new mongoose.Schema({
  // Identificação básica
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },
  
  // Tipo e valor do desconto
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountValue: { type: Number },
  minOrderValue: { type: Number, default: 0 },
  
  // Produtos/categorias aplicáveis
  applicableCategories: [{ type: String, enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'] }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Público-alvo
  customerType: { type: String, enum: ['ALL', 'NEW', 'EXISTING', 'SPECIFIC'], default: 'ALL' },
  specificCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Limites de uso
  maxTotalUses: { type: Number },
  maxUsesPerUser: { type: Number, default: 1 },
  totalUsedCount: { type: Number, default: 0 },
  userUses: [userUseSchema],
  
  // Regras de combinação
  allowWithCashback: { type: Boolean, default: true },
  allowStacking: { type: Boolean, default: false },
  
  // Datas e horário de validade
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  hasNoEndDate: { type: Boolean, default: false },
  schedule: timeScheduleSchema,
  
  // Status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Verifica se o modelo já existe antes de compilar
module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
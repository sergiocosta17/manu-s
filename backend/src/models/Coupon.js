const mongoose = require('mongoose');

const timeScheduleSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  daysOfWeek: [{ 
    type: String, 
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] 
  }]
}, { _id: false });

const userUseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 0 },
  lastUsedAt: { type: Date }
}, { _id: false });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },
  discountType: { 
    type: String, 
    enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], 
    required: true 
  },
  discountValue: { type: Number, required: true },
  maxDiscountValue: { type: Number },
  minOrderValue: { type: Number, default: 0 },
  applicableCategories: [{ 
    type: String, 
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'] 
  }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  customerType: { 
    type: String, 
    enum: ['ALL', 'NEW', 'EXISTING', 'SPECIFIC'], 
    default: 'ALL' 
  },
  specificCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxTotalUses: { type: Number },
  maxUsesPerUser: { type: Number, default: 1 },
  totalUsedCount: { type: Number, default: 0 },
  userUses: [userUseSchema],
  allowWithCashback: { type: Boolean, default: true },
  allowStacking: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  hasNoEndDate: { type: Boolean, default: false },
  schedule: timeScheduleSchema,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Verifica se o modelo já existe antes de compilar
module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
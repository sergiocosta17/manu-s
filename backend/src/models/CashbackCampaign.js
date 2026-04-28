const mongoose = require('mongoose');

const timeScheduleSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "HH:MM" formato 24h
  endTime: { type: String, required: true },
  daysOfWeek: [{ 
    type: String, 
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] 
  }]
}, { _id: false });

const userUseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 0 }
}, { _id: false });

const cashbackCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  multiplier: { type: Number },
  fixedPercentage: { type: Number },
  categories: [{ 
    type: String, 
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'] 
  }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  maxCashbackValue: { type: Number },
  maxUsesPerUser: { type: Number },
  userUses: [userUseSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  hasNoEndDate: { type: Boolean, default: false },
  schedule: timeScheduleSchema,
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Verifica se o modelo já existe antes de compilar
module.exports = mongoose.models.CashbackCampaign || mongoose.model('CashbackCampaign', cashbackCampaignSchema);
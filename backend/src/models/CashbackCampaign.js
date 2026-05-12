const mongoose = require('mongoose');

// Schema de horário (sem _id)
const timeScheduleSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "HH:MM" formato 24h
  endTime: { type: String, required: true },
  daysOfWeek: [{ 
    type: String, 
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] 
  }]
}, { _id: false });

// Schema de uso por usuário (sem _id)
const userUseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 0 }
}, { _id: false });

// Schema principal da campanha de cashback
const cashbackCampaignSchema = new mongoose.Schema({
  // Campos obrigatórios
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  
  // Campos opcionais de configuração
  description: { type: String },
  multiplier: { type: Number },
  fixedPercentage: { type: Number },
  maxCashbackValue: { type: Number },
  maxUsesPerUser: { type: Number },
  
  // Produtos/categorias aplicáveis
  categories: [{ 
    type: String, 
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'] 
  }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Controle de uso
  userUses: [userUseSchema],
  
  // Datas e vigência
  endDate: { type: Date },
  hasNoEndDate: { type: Boolean, default: false },
  
  // Horário de funcionamento
  schedule: timeScheduleSchema,
  
  // Mídia e status
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Verifica se o modelo já existe antes de compilar
module.exports = mongoose.models.CashbackCampaign || mongoose.model('CashbackCampaign', cashbackCampaignSchema);
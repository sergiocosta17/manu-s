const mongoose = require('mongoose');

const cashbackSettingsSchema = new mongoose.Schema({
  // Habilita/desabilita o sistema de cashback
  isEnabled: { type: Boolean, default: true },
  
  // Percentual padrão de cashback (0-100)
  defaultPercentage: { type: Number, default: 5, min: 0, max: 100 },
  
  // Valor mínimo para resgate de cashback
  minRedeemValue: { type: Number, default: 5 },
  
  // Percentual máximo do pedido que pode ser pago com cashback (0-100)
  maxRedeemPercentage: { type: Number, default: 50, min: 0, max: 100 },
  
  // Valor máximo em reais que pode ser usado por pedido (opcional)
  maxRedeemValue: { type: Number },
  
  // Dias até expirar o cashback ganho
  defaultExpirationDays: { type: Number, default: 30 },
  
  // Mensagem exibida para o cliente sobre cashback
  displayMessage: { type: String, default: 'Ganhe cashback em todas as compras!' }
}, { timestamps: true });

module.exports = mongoose.model('CashbackSettings', cashbackSettingsSchema);
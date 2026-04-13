const mongoose = require('mongoose');

// Schema do modelo Coupon para cupons de desconto
const couponSchema = new mongoose.Schema({
  // Código do cupom (obrigatório, único e sempre em maiúsculas)
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  // Tipo de desconto: percentual ou valor fixo
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true
  },
  // Valor do desconto
  discountValue: {
    type: Number,
    required: true
  },
  // Valor mínimo do pedido para que o cupom seja aplicável
  minOrderValue: {
    type: Number,
    default: 0
  },
  // Número máximo de utilizações
  maxUses: {
    type: Number,
    default: null
  },
  // Quantidade de vezes que o cupom já foi utilizado
  usedCount: {
    type: Number,
    default: 0
  },
  // Data de início da validade do cupom
  startDate: {
    type: Date,
    required: true
  },
  // Data de término da validade do cupom
  endDate: {
    type: Date,
    required: true
  },
  // Define se o cupom está ativo
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Índice composto para otimizar consultas por código e status ativo
couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
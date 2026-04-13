const mongoose = require('mongoose');

// Schema do modelo Promotion para promoções de produtos
const promotionSchema = new mongoose.Schema({
  // Nome da promoção
  name: { type: String, required: true },
  // Lista de produtos participantes da promoção
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
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
  // Data de início da promoção
  startDate: {
    type: Date,
    required: true
  },
  // Data de término da promoção
  endDate: {
    type: Date,
    required: true
  },
  // Define se a promoção está ativa
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Índice composto para otimizar consultas de promoções ativas dentro do período
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
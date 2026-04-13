const mongoose = require('mongoose');

// Schema do modelo Banner para banners promocionais
const bannerSchema = new mongoose.Schema({
  // Título principal do banner (opcional)
  title: { type: String },
  
  // Subtítulo ou texto secundário
  subtitle: { type: String },
  
  // URL da imagem do banner (obrigatória)
  imageUrl: { type: String, required: true },
  
  // Localização onde o banner será exibido
  location: {
    type: String,
    enum: ['HOME', 'OFFERS'],
    default: 'HOME'
  },
  
  // Ordem de exibição para ordenação dos banners
  order: {
    type: Number,
    default: 0
  },
  
  // Define se o banner está ativo e visível no app
  isActive: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Índice composto para otimizar consultas de banners ativos por localização e ordem
bannerSchema.index({ location: 1, isActive: 1, order: 1 });

// Exporta o modelo Banner
module.exports = mongoose.model('Banner', bannerSchema);
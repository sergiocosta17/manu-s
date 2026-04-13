const mongoose = require('mongoose');

// Schema do modelo Product para produtos do cardápio
const productSchema = new mongoose.Schema({
  // Nome do produto
  name: {
    type: String,
    required: true
  },
  // Preço original do produto
  price: {
    type: Number,
    required: true
  },
  // Preço promocional 
  promotionalPrice: {
    type: Number,
    default: null
  },
  // Descrição detalhada do produto
  description: {
    type: String
  },
  // Categoria do produto
  category: {
    type: String,
    enum: ['BURGER', 'CHICKEN', 'COMBO', 'SIDE', 'DRINK', 'DESSERT'],
    required: true
  },
  // URL da imagem do produto
  imageUrl: {
    type: String
  },
  // Define se o produto aparece em destaque na vitrine
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Define se o produto está disponível para venda
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Índice para otimizar consultas por categoria e disponibilidade
productSchema.index({ category: 1, isAvailable: 1 });

// Índice para otimizar consultas de produtos em destaque disponíveis
productSchema.index({ isFeatured: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
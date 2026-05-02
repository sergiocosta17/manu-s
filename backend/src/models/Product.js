const mongoose = require('mongoose');

// Schema para opcionais individuais
const AddonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Schema para grupo de opcionais
const AddonGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  selectionType: {
    type: String,
    enum: ['SINGLE', 'MULTIPLE'],
    default: 'MULTIPLE'
  },
  minSelection: {
    type: Number,
    default: 0
  },
  maxSelection: {
    type: Number,
    default: 10
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  addons: [AddonSchema]
}, { _id: true });

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
  },
  // Grupos de opcionais/adicionais
  addonGroups: [AddonGroupSchema]
}, { timestamps: true });

// Índices para otimizar consultas
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
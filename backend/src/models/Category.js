const mongoose = require('mongoose');

// Schema do modelo Category para categorias de produtos
const categorySchema = new mongoose.Schema({
  // Nome da categoria
  name: { type: String, required: true },
  
  // Descrição opcional da categoria
  description: String,
  
  // URL da imagem representativa da categoria
  imageUrl: String,
  
  // Ordem de exibição para ordenação das categorias
  order: { type: Number, default: 0 },
  
  // Define se a categoria está ativa e visível
  isActive: { type: Boolean, default: true }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('Category', categorySchema);
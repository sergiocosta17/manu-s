const Product = require('../models/Product');
const { validateProductInput } = require('../utils/validators');

// Serviço responsável pela lógica de gerenciamento de produtos
class ProductService {
  // Lista todos os produtos com paginação simples
  async getAllProducts(limit = 10, offset = 0) {
    return await Product.find().skip(offset).limit(limit);
  }

  // Busca um produto específico por ID
  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Produto não encontrado');
    }
    return product;
  }

  // Cria um novo produto após validação dos dados
  async createProduct(productData) {
    validateProductInput(productData);
    const product = new Product(productData);
    return await product.save();
  }

  // Atualiza um produto existente por ID
  async updateProduct(id, productData) {
    validateProductInput(productData);
    const product = await Product.findByIdAndUpdate(id, productData, { new: true });
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  }

  // Remove um produto do banco de dados
  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return true;
  }
}

// Exporta uma instância única do serviço
module.exports = new ProductService();
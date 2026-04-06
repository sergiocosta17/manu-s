const Product = require('../models/Product');
const { validateProductInput } = require('../utils/validators');

class ProductService {
  async getAllProducts(limit = 10, offset = 0) {
    return await Product.find().skip(offset).limit(limit);
  }

  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Produto não encontrado');
    }
    return product;
  }

  async createProduct(productData) {
    validateProductInput(productData);
    
    const product = new Product(productData);
    return await product.save();
  }
}

module.exports = new ProductService();
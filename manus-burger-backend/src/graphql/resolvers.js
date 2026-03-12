const Product = require('../models/Product');

const resolvers = {
  Query: {
    getProducts: async () => await Product.find(),
    getProduct: async (_, { id }) => await Product.findById(id),
  },
  Mutation: {
    addProduct: async (_, args) => {
      const product = new Product(args);
      return await product.save();
    },
    updateProduct: async (_, { id, ...updates }) => {
      return await Product.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteProduct: async (_, { id }) => {
      await Product.findByIdAndDelete(id);
      return "Product deleted successfully";
    }
  }
};

module.exports = resolvers;
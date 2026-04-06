const ProductService = require('../services/ProductService');
const OrderService = require('../services/OrderService');
const AuthService = require('../services/AuthService');

const resolvers = {
  Query: {
    products: async (_, { limit, offset }) => {
      return await ProductService.getAllProducts(limit, offset);
    },
    product: async (_, { id }) => {
      return await ProductService.getProductById(id);
    },
    orders: async (_, { limit, offset }, context) => {
      if (!context.user) throw new Error('Não autorizado');
      return await OrderService.getAllOrders(limit, offset);
    }
  },
  
  Mutation: {
    signup: async (_, { name, email, password }) => {
      return await AuthService.signup(name, email, password);
    },
    login: async (_, { email, password }) => {
      return await AuthService.login(email, password);
    },
    createProduct: async (_, { input }, context) => {
      if (!context.user) throw new Error('Não autorizado');
      return await ProductService.createProduct(input);
    },
    createOrder: async (_, { input }, context) => {
      if (!context.user) throw new Error('Não autorizado');
      return await OrderService.createOrder(input, context.user.id); 
    }
  }
};

module.exports = resolvers;
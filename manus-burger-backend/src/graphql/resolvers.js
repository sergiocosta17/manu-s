const ProductService = require('../services/ProductService');
const OrderService = require('../services/OrderService');
const AuthService = require('../services/AuthService');

const requireAuth = (context) => {
  if (!context.user) throw new Error('Não autorizado');
};

const requireAdmin = (context) => {
  requireAuth(context);
  if (context.user.role !== 'ADMIN') throw new Error('Acesso negado. Requer privilégios de administrador.');
};

const resolvers = {
  Query: {
    products: async (_, { limit, offset }) => {
      return await ProductService.getAllProducts(limit, offset);
    },
    product: async (_, { id }) => {
      return await ProductService.getProductById(id);
    },
    orders: async (_, { limit, offset, status }, context) => {
      requireAuth(context);
      return await OrderService.getAllOrders(limit, offset, status, context.user.id, context.user.role);
    },
    order: async (_, { id }, context) => {
      requireAuth(context);
      return await OrderService.getOrderById(id, context.user.id, context.user.role);
    },
    dashboardMetrics: async (_, __, context) => {
      requireAdmin(context);
      return await OrderService.getDashboardMetrics();
    }
  },
  
  Mutation: {
    signup: async (_, { name, email, password, role, adminKey }) => {
      return await AuthService.signup(name, email, password, role, adminKey);
    },
    login: async (_, { email, password }) => {
      return await AuthService.login(email, password);
    },
    createProduct: async (_, { input }, context) => {
      requireAdmin(context);
      return await ProductService.createProduct(input);
    },
    updateProduct: async (_, { id, input }, context) => {
      requireAdmin(context);
      return await ProductService.updateProduct(id, input);
    },
    deleteProduct: async (_, { id }, context) => {
      requireAdmin(context);
      return await ProductService.deleteProduct(id);
    },
    createOrder: async (_, { input }, context) => {
      requireAuth(context);
      return await OrderService.createOrder(input, context.user.id); 
    },
    updateOrderStatus: async (_, { id, status }, context) => {
      requireAdmin(context);
      return await OrderService.updateOrderStatus(id, status);
    }
  }
};

module.exports = resolvers;
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

const verifyToken = (token) => {
  if (!token) throw new AuthenticationError('Token not provided');
  try {
    return jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

const resolvers = {
  Query: {
    getProducts: async () => await Product.find(),
    getProduct: async (_, { id }) => await Product.findById(id),
    getOrders: async (_, __, { token }) => {
      const user = verifyToken(token);
      if (user.role !== 'admin') throw new ForbiddenError('Not authorized');
      return await Order.find().populate('items.product');
    },
    getMyOrders: async (_, __, { token }) => {
      const user = verifyToken(token);
      return await Order.find({ client: user.id }).populate('items.product');
    }
  },
  Mutation: {
    addProduct: async (_, args, { token }) => {
      const user = verifyToken(token);
      if (user.role !== 'admin') throw new ForbiddenError('Not authorized');
      const product = new Product(args);
      return await product.save();
    },
    updateProduct: async (_, { id, ...updates }, { token }) => {
      const user = verifyToken(token);
      if (user.role !== 'admin') throw new ForbiddenError('Not authorized');
      return await Product.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteProduct: async (_, { id }, { token }) => {
      const user = verifyToken(token);
      if (user.role !== 'admin') throw new ForbiddenError('Not authorized');
      await Product.findByIdAndDelete(id);
      return "Deleted";
    },
    createOrder: async (_, { items, totalPrice }, { token }) => {
      const user = verifyToken(token);
      const order = new Order({
        client: user.id,
        items,
        totalPrice
      });
      await order.save();
      return order;
    },
    updateOrderStatus: async (_, { id, status }, { token }) => {
      const user = verifyToken(token);
      if (user.role !== 'admin') throw new ForbiddenError('Not authorized');
      return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }
  }
};

module.exports = resolvers;
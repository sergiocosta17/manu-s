const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const resolvers = {
  Query: {
    products: async (_, { category }) => {
      const filter = category ? { category } : {};
      return await Product.find(filter);
    },
    orders: async (_, __, { user }) => {
      if (!user) throw new Error('Não autenticado');
      if (user.role === 'ADMIN') return await Order.find().populate('user').populate('items.product');
      return await Order.find({ user: user.userId }).populate('items.product');
    }
  },

  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Não autorizado');
      const product = new Product(input);
      return await product.save();
    },

    updateProduct: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Não autorizado');
      return await Product.findByIdAndUpdate(
        id,
        { $set: input },
        { returnDocument: 'after', runValidators: true }
      );
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Não autorizado');
      await Product.findByIdAndDelete(id);
      return true;
    },

    createOrder: async (_, { input }, { user }) => {
      if (!user) throw new Error('Não autenticado');
      const order = new Order({
        ...input,
        user: user.userId,
        status: 'PENDING'
      });
      return await order.save();
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Não autorizado');
      return await Order.findByIdAndUpdate(
        id,
        { $set: { status } },
        { returnDocument: 'after', runValidators: true }
      );
    },

    signup: async (_, { name, email, password, role, adminKey }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('E-mail já cadastrado');

      if (role === 'ADMIN' && adminKey !== process.env.ADMIN_KEY) {
        throw new Error('Chave de administrador inválida');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ name, email, password: hashedPassword, role: role || 'USER' });
      await user.save();

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Usuário não encontrado');

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) throw new Error('Senha incorreta');

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    }
  }
};

module.exports = resolvers;
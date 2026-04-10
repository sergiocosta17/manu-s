const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Banner = require('../models/Banner');
const Promotion = require('../models/Promotion');
const Coupon = require('../models/Coupon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Helper para verificar autenticação
const requireAuth = (user) => {
  if (!user) throw new Error('Não autenticado');
  return user;
};

// Helper para verificar admin
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'ADMIN') throw new Error('Não autorizado');
  return user;
};

const resolvers = {
  Query: {
    // ==================== AUTH ====================
    me: async (_, __, { user }) => {
      requireAuth(user);
      return await User.findById(user.userId);
    },

    // ==================== PRODUCTS ====================
    products: async (_, { category, onlyAvailable = true }) => {
      const filter = {};
      if (category) filter.category = category;
      if (onlyAvailable) filter.isAvailable = true;
      return await Product.find(filter).sort({ createdAt: -1 });
    },

    product: async (_, { id }) => {
      return await Product.findById(id);
    },

    featuredProducts: async () => {
      return await Product.find({ isFeatured: true, isAvailable: true });
    },

    productsOnSale: async () => {
      return await Product.find({ 
        promotionalPrice: { $ne: null, $exists: true },
        isAvailable: true 
      });
    },

    // ==================== BANNERS ====================
    banners: async (_, { location }) => {
      const filter = { isActive: true };
      if (location) filter.location = location;
      return await Banner.find(filter).sort({ order: 1 });
    },

    // ==================== ORDERS ====================
    orders: async (_, { status, limit = 50, offset = 0 }, { user }) => {
      requireAuth(user);
      const filter = {};
      
      if (user.role !== 'ADMIN') {
        filter.user = user.userId;
      }
      
      if (status) filter.status = status;
      
      return await Order.find(filter)
        .populate('user')
        .populate('items.product')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    order: async (_, { id }, { user }) => {
      requireAuth(user);
      const order = await Order.findById(id)
        .populate('user')
        .populate('items.product');
      
      if (!order) throw new Error('Pedido não encontrado');
      
      if (user.role !== 'ADMIN' && order.user._id.toString() !== user.userId) {
        throw new Error('Não autorizado');
      }
      
      return order;
    },

    activeOrders: async (_, __, { user }) => {
      requireAuth(user);
      const filter = {
        status: { $nin: ['COMPLETED', 'CANCELLED'] }
      };
      
      if (user.role !== 'ADMIN') {
        filter.user = user.userId;
      }
      
      return await Order.find(filter)
        .populate('user')
        .populate('items.product')
        .sort({ createdAt: -1 });
    },

    orderHistory: async (_, { limit = 50, offset = 0 }, { user }) => {
      requireAuth(user);
      const filter = {
        user: user.userId,
        status: { $in: ['COMPLETED', 'CANCELLED'] }
      };
      
      return await Order.find(filter)
        .populate('items.product')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    // ==================== PROMOTIONS ====================
    promotions: async (_, { onlyActive = false }, { user }) => {
      requireAdmin(user);
      const filter = {};
      if (onlyActive) {
        const now = new Date();
        filter.isActive = true;
        filter.startDate = { $lte: now };
        filter.endDate = { $gte: now };
      }
      return await Promotion.find(filter).populate('products');
    },

    promotion: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await Promotion.findById(id).populate('products');
    },

    activePromotions: async () => {
      const now = new Date();
      return await Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('products');
    },

    // ==================== COUPONS ====================
    coupons: async (_, __, { user }) => {
      requireAdmin(user);
      return await Coupon.find().sort({ createdAt: -1 });
    },

    coupon: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await Coupon.findById(id);
    },

    validateCoupon: async (_, { code, orderTotal }) => {
      const now = new Date();
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      if (!coupon) {
        return { valid: false, message: 'Cupom inválido ou expirado', discount: 0 };
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, message: 'Cupom esgotado', discount: 0 };
      }

      if (orderTotal < coupon.minOrderValue) {
        return { 
          valid: false, 
          message: `Pedido mínimo de R$ ${coupon.minOrderValue.toFixed(2)}`, 
          discount: 0 
        };
      }

      const discount = coupon.discountType === 'PERCENTAGE'
        ? (orderTotal * coupon.discountValue) / 100
        : coupon.discountValue;

      return { valid: true, message: 'Cupom válido!', discount };
    },

    // ==================== DASHBOARD ====================
    dashboardMetrics: async (_, __, { user }) => {
      requireAdmin(user);
      
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalOrders,
        pendingOrders,
        totalRevenueResult,
        todayStats,
        weekStats,
        monthStats
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] } }),
        Order.aggregate([
          { $match: { status: { $nin: ['CANCELLED'] } } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfDay }, status: { $nin: ['CANCELLED'] } } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfWeek }, status: { $nin: ['CANCELLED'] } } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth }, status: { $nin: ['CANCELLED'] } } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }
        ])
      ]);

      return {
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        todayOrders: todayStats[0]?.count || 0,
        todayRevenue: todayStats[0]?.revenue || 0,
        weekOrders: weekStats[0]?.count || 0,
        weekRevenue: weekStats[0]?.revenue || 0,
        monthOrders: monthStats[0]?.count || 0,
        monthRevenue: monthStats[0]?.revenue || 0
      };
    },

    // ==================== SHIPPING ====================
    calculateShipping: async (_, { zipCode }) => {
      // Implementação simplificada - integrar com API dos Correios
      // Por enquanto retorna valor fixo baseado no CEP
      const fee = 10.0; // R$ 10,00 fixo
      const estimatedDays = 3;
      
      return { fee, estimatedDays };
    },

    // ==================== STORE INFO ====================
    storeInfo: async () => {
      return await User.findOne({ role: 'ADMIN' });
    }
  },

  Mutation: {
    // ==================== AUTH ====================
    signup: async (_, { name, email, password, role, adminKey }) => {
      
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('E-mail já cadastrado');

      if (role === 'ADMIN') {
        if (adminKey !== config.adminAccessKey) {
          throw new Error('Chave de administrador inválida');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
        addresses: [],
        paymentMethods: []
      });

      await user.save();

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Credenciais inválidas');

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Credenciais inválidas');

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return { token, user };
    },

    changePassword: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      const isValid = await bcrypt.compare(input.currentPassword, dbUser.password);
      
      if (!isValid) throw new Error('Senha atual incorreta');
      
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);
      await User.findByIdAndUpdate(user.userId, { password: hashedPassword });
      
      return true;
    },

    // ==================== PROFILE ====================
    updateProfile: async (_, { input }, { user }) => {
      requireAuth(user);
      return await User.findByIdAndUpdate(
        user.userId,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    updateStore: async (_, { input }, { user }) => {
      requireAdmin(user);
      return await User.findByIdAndUpdate(
        user.userId,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    // ==================== ADDRESSES ====================
    addAddress: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      
      // Se é o primeiro endereço ou marcado como default, define como principal
      if (dbUser.addresses.length === 0 || input.isDefault) {
        // Remove default dos outros
        dbUser.addresses.forEach(addr => addr.isDefault = false);
        input.isDefault = true;
      }
      
      dbUser.addresses.push(input);
      await dbUser.save();
      
      return dbUser;
    },

    updateAddress: async (_, { addressId, input }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      const addressIndex = dbUser.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );
      
      if (addressIndex === -1) throw new Error('Endereço não encontrado');
      
      if (input.isDefault) {
        dbUser.addresses.forEach(addr => addr.isDefault = false);
      }
      
      dbUser.addresses[addressIndex] = { 
        ...dbUser.addresses[addressIndex].toObject(), 
        ...input 
      };
      
      await dbUser.save();
      return dbUser;
    },

    deleteAddress: async (_, { addressId }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      const wasDefault = dbUser.addresses.find(
        addr => addr._id.toString() === addressId
      )?.isDefault;
      
      dbUser.addresses = dbUser.addresses.filter(
        addr => addr._id.toString() !== addressId
      );
      
      // Se removeu o default e ainda tem endereços, define o primeiro como default
      if (wasDefault && dbUser.addresses.length > 0) {
        dbUser.addresses[0].isDefault = true;
      }
      
      await dbUser.save();
      return dbUser;
    },

    setDefaultAddress: async (_, { addressId }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      
      dbUser.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });
      
      await dbUser.save();
      return dbUser;
    },

    // ==================== PAYMENT METHODS ====================
    addPaymentMethod: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      
      if (dbUser.paymentMethods.length === 0 || input.isDefault) {
        dbUser.paymentMethods.forEach(pm => pm.isDefault = false);
        input.isDefault = true;
      }
      
      dbUser.paymentMethods.push(input);
      await dbUser.save();
      
      return dbUser;
    },

    deletePaymentMethod: async (_, { paymentMethodId }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      const wasDefault = dbUser.paymentMethods.find(
        pm => pm._id.toString() === paymentMethodId
      )?.isDefault;
      
      dbUser.paymentMethods = dbUser.paymentMethods.filter(
        pm => pm._id.toString() !== paymentMethodId
      );
      
      if (wasDefault && dbUser.paymentMethods.length > 0) {
        dbUser.paymentMethods[0].isDefault = true;
      }
      
      await dbUser.save();
      return dbUser;
    },

    setDefaultPaymentMethod: async (_, { paymentMethodId }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      
      dbUser.paymentMethods.forEach(pm => {
        pm.isDefault = pm._id.toString() === paymentMethodId;
      });
      
      await dbUser.save();
      return dbUser;
    },

    // ==================== PRODUCTS ====================
    createProduct: async (_, { input }, { user }) => {
      requireAdmin(user);
      const product = new Product({
        ...input,
        isFeatured: input.isFeatured || false,
        isAvailable: input.isAvailable !== false
      });
      return await product.save();
    },

    updateProduct: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await Product.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteProduct: async (_, { id }, { user }) => {
      requireAdmin(user);
      await Product.findByIdAndDelete(id);
      return true;
    },

    toggleProductAvailability: async (_, { id }, { user }) => {
      requireAdmin(user);
      const product = await Product.findById(id);
      product.isAvailable = !product.isAvailable;
      return await product.save();
    },

    toggleProductFeatured: async (_, { id }, { user }) => {
      requireAdmin(user);
      const product = await Product.findById(id);
      product.isFeatured = !product.isFeatured;
      return await product.save();
    },

    // ==================== BANNERS ====================
    createBanner: async (_, { input }, { user }) => {
      requireAdmin(user);
      const banner = new Banner({
        ...input,
        location: input.location || 'HOME',
        order: input.order || 0,
        isActive: input.isActive !== false
      });
      return await banner.save();
    },

    updateBanner: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await Banner.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteBanner: async (_, { id }, { user }) => {
      requireAdmin(user);
      await Banner.findByIdAndDelete(id);
      return true;
    },

    // ==================== ORDERS ====================
    createOrder: async (_, { input }, { user }) => {
      requireAuth(user);
      
      // Aplicar cupom se fornecido
      let discount = input.discount || 0;
      if (input.couponCode) {
        const coupon = await Coupon.findOne({ 
          code: input.couponCode.toUpperCase(),
          isActive: true 
        });
        
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
      
      const order = new Order({
        ...input,
        user: user.userId,
        status: 'PLACED',
        paymentStatus: ['CASH', 'CARD_ON_DELIVERY'].includes(input.paymentMethod) 
          ? 'PENDING' 
          : 'PENDING',
        statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
      });
      
      await order.save();
      return await Order.findById(order._id).populate('user').populate('items.product');
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      requireAdmin(user);
      
      const order = await Order.findById(id);
      if (!order) throw new Error('Pedido não encontrado');
      
      order.status = status;
      order.statusHistory.push({ status, timestamp: new Date() });
      
      // Se entregue via pagamento na entrega, marca como pago
      if (status === 'DELIVERED' && ['CASH', 'CARD_ON_DELIVERY'].includes(order.paymentMethod)) {
        order.paymentStatus = 'PAID';
      }
      
      await order.save();
      return await Order.findById(id).populate('user').populate('items.product');
    },

    confirmOrderReceived: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const order = await Order.findById(id);
      if (!order) throw new Error('Pedido não encontrado');
      
      if (order.user.toString() !== user.userId) {
        throw new Error('Não autorizado');
      }
      
      if (order.status !== 'DELIVERED') {
        throw new Error('Pedido ainda não foi entregue');
      }
      
      order.status = 'COMPLETED';
      order.customerConfirmedAt = new Date();
      order.statusHistory.push({ status: 'COMPLETED', timestamp: new Date() });
      
      await order.save();
      return await Order.findById(id).populate('user').populate('items.product');
    },

    // ==================== PROMOTIONS ====================
    createPromotion: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const promotion = new Promotion({
        ...input,
        isActive: input.isActive !== false
      });
      
      // Atualiza o preço promocional dos produtos
      if (input.discountType === 'FIXED') {
        await Product.updateMany(
          { _id: { $in: input.products } },
          { $set: { promotionalPrice: input.discountValue } }
        );
      }
      
      await promotion.save();
      return await Promotion.findById(promotion._id).populate('products');
    },

    updatePromotion: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await Promotion.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      ).populate('products');
    },

    deletePromotion: async (_, { id }, { user }) => {
      requireAdmin(user);
      
      const promotion = await Promotion.findById(id);
      if (promotion) {
        // Remove preço promocional dos produtos
        await Product.updateMany(
          { _id: { $in: promotion.products } },
          { $set: { promotionalPrice: null } }
        );
      }
      
      await Promotion.findByIdAndDelete(id);
      return true;
    },

    // ==================== COUPONS ====================
    createCoupon: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const coupon = new Coupon({
        ...input,
        code: input.code.toUpperCase(),
        usedCount: 0,
        isActive: input.isActive !== false
      });
      
      return await coupon.save();
    },

    updateCoupon: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      
      if (input.code) {
        input.code = input.code.toUpperCase();
      }
      
      return await Coupon.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteCoupon: async (_, { id }, { user }) => {
      requireAdmin(user);
      await Coupon.findByIdAndDelete(id);
      return true;
    },

    applyCoupon: async (_, { code }, { user }) => {
      requireAuth(user);
      
      const now = new Date();
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      
      if (!coupon) throw new Error('Cupom inválido ou expirado');
      
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new Error('Cupom esgotado');
      }
      
      return coupon;
    }
  }
};

module.exports = resolvers;
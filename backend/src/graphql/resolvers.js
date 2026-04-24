const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Banner = require('../models/Banner');
const Promotion = require('../models/Promotion');
const Coupon = require('../models/Coupon');
const Courier = require('../models/Courier');
const StoreSettings = require('../models/StoreSettings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Helpers de autenticação/autorização
const requireAuth = (user) => {
  if (!user) throw new Error('Não autenticado');
  return user;
};

const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'ADMIN') throw new Error('Não autorizado');
  return user;
};

// Helper para calcular datas de período
const getPeriodDates = (period) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'DAY':
      return { start: startOfDay, end: now };
    case 'WEEK':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return { start: startOfWeek, end: now };
    case 'MONTH':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: now };
    case 'YEAR':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfYear, end: now };
    default:
      return { start: new Date(0), end: now };
  }
};

const resolvers = {
  // Field resolver para Courier
  Courier: {
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`
  },

  Query: {
    // AUTH 
    me: async (_, __, { user }) => {
      requireAuth(user);
      return await User.findById(user.userId);
    },

    // PRODUCTS
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

    // BANNERS
    banners: async (_, { location }) => {
      const filter = { isActive: true };
      if (location) filter.location = location;
      return await Banner.find(filter).sort({ order: 1 });
    },

    // COURIERS (ENTREGADORES)
    couriers: async (_, { onlyActive }, { user }) => {
      requireAdmin(user);
      const filter = {};
      if (onlyActive) filter.isActive = true;
      return await Courier.find(filter).sort({ createdAt: -1 });
    },

    courier: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await Courier.findById(id);
    },

    availableCouriers: async (_, __, { user }) => {
      requireAdmin(user);
      return await Courier.find({ isActive: true }).sort({ firstName: 1 });
    },

    couriersMetrics: async (_, { period }, { user }) => {
      requireAdmin(user);
      
      const { start, end } = getPeriodDates(period);
      
      // Total de entregadores
      const totalCouriers = await Courier.countDocuments();
      const activeCouriers = await Courier.countDocuments({ isActive: true });
      
      // Totais gerais (all time)
      const allCouriers = await Courier.find();
      const totalDeliveries = allCouriers.reduce((acc, c) => acc + c.totalDeliveries, 0);
      const totalEarnings = allCouriers.reduce((acc, c) => acc + c.totalEarnings, 0);
      
      // Métricas do período - buscar pedidos entregues no período
      const periodOrders = await Order.find({
        status: { $in: ['DELIVERED', 'COMPLETED'] },
        deliveryType: 'DELIVERY',
        courier: { $ne: null },
        updatedAt: { $gte: start, $lte: end }
      }).populate('courier');
      
      const periodDeliveries = periodOrders.length;
      const periodEarnings = periodOrders.reduce((acc, o) => acc + (o.shippingFee || 0), 0);
      
      // Métricas por entregador no período
      const courierMetricsMap = {};
      
      periodOrders.forEach(order => {
        if (order.courier) {
          const courierId = order.courier._id.toString();
          if (!courierMetricsMap[courierId]) {
            courierMetricsMap[courierId] = {
              courierId,
              courierName: `${order.courier.firstName} ${order.courier.lastName}`,
              deliveries: 0,
              earnings: 0
            };
          }
          courierMetricsMap[courierId].deliveries += 1;
          courierMetricsMap[courierId].earnings += order.shippingFee || 0;
        }
      });
      
      // Incluir entregadores ativos sem entregas no período
      for (const courier of allCouriers) {
        const courierId = courier._id.toString();
        if (!courierMetricsMap[courierId]) {
          courierMetricsMap[courierId] = {
            courierId,
            courierName: `${courier.firstName} ${courier.lastName}`,
            deliveries: 0,
            earnings: 0
          };
        }
      }
      
      const courierMetrics = Object.values(courierMetricsMap).sort((a, b) => b.deliveries - a.deliveries);
      
      return {
        totalCouriers,
        activeCouriers,
        totalDeliveries,
        totalEarnings,
        periodDeliveries,
        periodEarnings,
        courierMetrics
      };
    },

    courierDeliveries: async (_, { courierId, period }, { user }) => {
      requireAdmin(user);
      
      const { start, end } = getPeriodDates(period);
      
      return await Order.find({
        courier: courierId,
        status: { $in: ['DELIVERED', 'COMPLETED'] },
        updatedAt: { $gte: start, $lte: end }
      })
        .populate('user')
        .populate('items.product')
        .populate('courier')
        .sort({ updatedAt: -1 });
    },

    // ORDERS 
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
        .populate('courier')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    order: async (_, { id }, { user }) => {
      requireAuth(user);
      const order = await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
      
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
        .populate('courier')
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
        .populate('courier')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    // PROMOTIONS
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

    // COUPONS 
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

    // DASHBOARD
    dashboardMetrics: async (_, __, { user }) => {
      requireAdmin(user);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
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

    // SHIPPING
    calculateShipping: async (_, { zipCode }) => {
      const fee = 5.0;
      const estimatedDays = 1;
      return { fee, estimatedDays };
    },

    // STORE
    storeInfo: async () => {
      return await User.findOne({ role: 'ADMIN' });
    },

    storeSettings: async () => {
      try {
        let settings = await StoreSettings.findOne();
        
        if (!settings) {
          settings = await StoreSettings.create({
            storeName: null,
            storeAddress: null,
            storePhone: null,
            businessHours: null
          });
        }
        
        return {
          id: settings._id.toString(),
          storeName: settings.storeName,
          storeAddress: settings.storeAddress,
          storePhone: settings.storePhone,
          businessHours: settings.businessHours,
          createdAt: settings.createdAt?.toISOString(),
          updatedAt: settings.updatedAt?.toISOString()
        };
      } catch (error) {
        console.error('Erro ao buscar storeSettings:', error);
        throw new Error('Erro ao buscar configurações da loja');
      }
    }
  },

  Mutation: {
    // AUTH 
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

    // PROFILE 
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

    // STORE SETTINGS
    updateStoreSettings: async (_, { input }, { user }) => {
      try {
        requireAdmin(user);

        let settings = await StoreSettings.findOne();

        if (!settings) {
          settings = new StoreSettings({
            storeName: input.storeName || null,
            storeAddress: input.storeAddress || null,
            storePhone: input.storePhone || null,
            businessHours: input.businessHours || null
          });
        } else {
          if (input.storeName !== undefined) settings.storeName = input.storeName;
          if (input.storeAddress !== undefined) settings.storeAddress = input.storeAddress;
          if (input.storePhone !== undefined) settings.storePhone = input.storePhone;
          if (input.businessHours !== undefined) settings.businessHours = input.businessHours;
        }

        await settings.save();

        return {
          id: settings._id.toString(),
          storeName: settings.storeName,
          storeAddress: settings.storeAddress,
          storePhone: settings.storePhone,
          businessHours: settings.businessHours,
          createdAt: settings.createdAt?.toISOString(),
          updatedAt: settings.updatedAt?.toISOString()
        };
        
      } catch (error) {
        console.error('Erro ao salvar storeSettings:', error);
        throw new Error('Erro ao salvar horários: ' + error.message);
      }
    },

    // ADDRESSES
    addAddress: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const dbUser = await User.findById(user.userId);
      
      if (dbUser.addresses.length === 0 || input.isDefault) {
        dbUser.addresses.forEach(addr => addr.isDefault = false);
        input.isDefault = true;
      }
      
      if (!input.label) {
        input.label = dbUser.addresses.length === 0 ? 'Casa' : `Endereço ${dbUser.addresses.length + 1}`;
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

    // PAYMENT METHODS
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

    // PRODUCTS
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

    // BANNERS
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

    // COURIERS (ENTREGADORES)
    createCourier: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      // Verificar se já existe entregador com mesmo email ou CPF
      const existingEmail = await Courier.findOne({ email: input.email });
      if (existingEmail) throw new Error('Já existe um entregador com este e-mail');
      
      const existingCpf = await Courier.findOne({ cpf: input.cpf });
      if (existingCpf) throw new Error('Já existe um entregador com este CPF');
      
      const courier = new Courier({
        ...input,
        isActive: input.isActive !== false,
        totalDeliveries: 0,
        totalEarnings: 0
      });
      
      return await courier.save();
    },

    updateCourier: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      
      // Verificar duplicatas se email ou CPF estão sendo atualizados
      if (input.email) {
        const existingEmail = await Courier.findOne({ email: input.email, _id: { $ne: id } });
        if (existingEmail) throw new Error('Já existe um entregador com este e-mail');
      }
      
      if (input.cpf) {
        const existingCpf = await Courier.findOne({ cpf: input.cpf, _id: { $ne: id } });
        if (existingCpf) throw new Error('Já existe um entregador com este CPF');
      }
      
      return await Courier.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteCourier: async (_, { id }, { user }) => {
      requireAdmin(user);
      
      // Verificar se há pedidos em andamento com este entregador
      const activeOrders = await Order.countDocuments({
        courier: id,
        status: { $in: ['OUT_FOR_DELIVERY'] }
      });
      
      if (activeOrders > 0) {
        throw new Error('Não é possível excluir entregador com entregas em andamento');
      }
      
      await Courier.findByIdAndDelete(id);
      return true;
    },

    toggleCourierActive: async (_, { id }, { user }) => {
      requireAdmin(user);
      const courier = await Courier.findById(id);
      
      if (!courier) throw new Error('Entregador não encontrado');
      
      // Se for desativar, verificar se há entregas em andamento
      if (courier.isActive) {
        const activeOrders = await Order.countDocuments({
          courier: id,
          status: { $in: ['OUT_FOR_DELIVERY'] }
        });
        
        if (activeOrders > 0) {
          throw new Error('Não é possível desativar entregador com entregas em andamento');
        }
      }
      
      courier.isActive = !courier.isActive;
      return await courier.save();
    },

    // ORDERS
    createOrder: async (_, { input }, { user }) => {
      requireAuth(user);
      
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
      return await Order.findById(order._id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      requireAdmin(user);
      
      const order = await Order.findById(id);
      if (!order) throw new Error('Pedido não encontrado');
      
      order.status = status;
      order.statusHistory.push({ status, timestamp: new Date() });
      
      if (status === 'DELIVERED' && ['CASH', 'CARD_ON_DELIVERY'].includes(order.paymentMethod)) {
        order.paymentStatus = 'PAID';
      }
      
      // Se o pedido foi entregue, atualizar estatísticas do entregador
      if (status === 'DELIVERED' && order.courier) {
        await Courier.findByIdAndUpdate(order.courier, {
          $inc: {
            totalDeliveries: 1,
            totalEarnings: order.shippingFee || 0
          }
        });
      }
      
      await order.save();
      return await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    // ASSIGN COURIER TO ORDER
    assignCourier: async (_, { orderId, courierId }, { user }) => {
      requireAdmin(user);
      
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Pedido não encontrado');
      
      if (order.deliveryType !== 'DELIVERY') {
        throw new Error('Não é possível atribuir entregador a pedido de retirada');
      }
      
      const courier = await Courier.findById(courierId);
      if (!courier) throw new Error('Entregador não encontrado');
      
      if (!courier.isActive) {
        throw new Error('Entregador está inativo');
      }
      
      order.courier = courierId;
      
      // Se ainda não está em entrega, atualizar status
      if (order.status === 'PREPARING') {
        order.status = 'OUT_FOR_DELIVERY';
        order.statusHistory.push({ status: 'OUT_FOR_DELIVERY', timestamp: new Date() });
      }
      
      await order.save();
      
      return await Order.findById(orderId)
        .populate('user')
        .populate('items.product')
        .populate('courier');
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
      return await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    confirmDelivery: async (_, { id }, { user }) => {
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
      return await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    // PROMOTIONS
    createPromotion: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const promotion = new Promotion({
        ...input,
        isActive: input.isActive !== false
      });
      
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
        await Product.updateMany(
          { _id: { $in: promotion.products } },
          { $set: { promotionalPrice: null } }
        );
      }
      
      await Promotion.findByIdAndDelete(id);
      return true;
    },

    // COUPONS
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

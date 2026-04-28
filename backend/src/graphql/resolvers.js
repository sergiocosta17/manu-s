// graphql/resolvers.js
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Banner = require('../models/Banner');
const Promotion = require('../models/Promotion');
const Coupon = require('../models/Coupon');
const Courier = require('../models/Courier');
const StoreSettings = require('../models/StoreSettings');
const CashbackWallet = require('../models/CashbackWallet');
const CashbackRule = require('../models/CashbackRule');
const CashbackCampaign = require('../models/CashbackCampaign');
const CashbackSettings = require('../models/CashbackSettings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// ============================================
// HELPERS
// ============================================
const requireAuth = (user) => {
  if (!user) throw new Error('Não autenticado');
  return user;
};

const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'ADMIN') throw new Error('Não autorizado');
  return user;
};

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const validateDeliveryArea = (city, state) => {
  const normalizedCity = normalizeString(city);
  const normalizedState = normalizeString(state);
  const validCities = ['CAMPINA GRANDE'];
  const validStates = ['PB', 'PARAIBA'];
  return validCities.includes(normalizedCity) && validStates.includes(normalizedState);
};

const throwDeliveryAreaError = () => {
  throw new Error('Desculpe, nosso delivery atende apenas a cidade de Campina Grande - PB.');
};

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

const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === 'string') return user;
  if (user._id) return user._id.toString();
  if (user.id) return user.id.toString();
  return user.toString();
};

// ============================================
// SCHEDULE HELPERS (Horários)
// ============================================
const DAY_OF_WEEK_MAP = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY'
};

const isWithinSchedule = (schedule) => {
  if (!schedule) return true;
  
  const now = new Date();
  const currentDay = DAY_OF_WEEK_MAP[now.getDay()];
  
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    if (!schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }
  
  if (schedule.startTime && schedule.endTime) {
    const currentTime = now.toTimeString().slice(0, 5);
    const startTime = schedule.startTime;
    const endTime = schedule.endTime;
    
    if (startTime <= endTime) {
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    } else {
      if (currentTime < startTime && currentTime > endTime) {
        return false;
      }
    }
  }
  
  return true;
};

const getScheduleMessage = (schedule) => {
  if (!schedule) return null;
  
  const now = new Date();
  const currentDay = DAY_OF_WEEK_MAP[now.getDay()];
  
  const dayNames = {
    'SUNDAY': 'Domingo',
    'MONDAY': 'Segunda',
    'TUESDAY': 'Terça',
    'WEDNESDAY': 'Quarta',
    'THURSDAY': 'Quinta',
    'FRIDAY': 'Sexta',
    'SATURDAY': 'Sábado'
  };
  
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && !schedule.daysOfWeek.includes(currentDay)) {
    const validDays = schedule.daysOfWeek.map(d => dayNames[d]).join(', ');
    return `Válido apenas: ${validDays}`;
  }
  
  if (schedule.startTime && schedule.endTime) {
    return `Válido das ${schedule.startTime} às ${schedule.endTime}`;
  }
  
  return null;
};

// ============================================
// CASHBACK HELPERS
// ============================================
const getOrCreateWallet = async (userId) => {
  let wallet = await CashbackWallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await CashbackWallet.create({
      user: userId,
      balance: 0,
      totalEarned: 0,
      totalUsed: 0,
      totalExpired: 0,
      transactions: []
    });
  }
  return wallet;
};

const getCashbackSettings = async () => {
  let settings = await CashbackSettings.findOne();
  if (!settings) {
    settings = await CashbackSettings.create({
      isEnabled: true,
      defaultPercentage: 5,
      minRedeemValue: 5,
      maxRedeemPercentage: 50,
      defaultExpirationDays: 30,
      displayMessage: 'Ganhe cashback em todas as compras!'
    });
  }
  return settings;
};

const calculateCashbackToEarn = async (items, subtotal, userId, usedCoupon = false, usedCashback = false) => {
  const settings = await getCashbackSettings();
  
  if (!settings.isEnabled) {
    return { amount: 0, expirationDays: 0 };
  }
  
  const now = new Date();
  
  const orderCount = await Order.countDocuments({ user: userId, status: { $nin: ['CANCELLED'] } });
  const isFirstOrder = orderCount === 0;
  
  const rules = await CashbackRule.find({ isActive: true }).sort({ priority: -1 });
  
  const allCampaigns = await CashbackCampaign.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { hasNoEndDate: true },
      { endDate: { $gte: now } }
    ]
  });
  
  const campaigns = allCampaigns.filter(c => isWithinSchedule(c.schedule));
  
  let totalCashback = 0;
  let expirationDays = settings.defaultExpirationDays;
  
  for (const rule of rules) {
    if (usedCoupon && !rule.allowEarnWithCoupon) continue;
    if (usedCashback && !rule.allowEarnOnCashbackPayment) continue;
    if (rule.minOrderValue && subtotal < rule.minOrderValue) continue;
    
    let applicableAmount = 0;
    
    switch (rule.type) {
      case 'GLOBAL':
        applicableAmount = subtotal;
        break;
      case 'FIRST_ORDER':
        if (isFirstOrder) {
          applicableAmount = subtotal;
        }
        break;
      case 'MIN_VALUE':
        applicableAmount = subtotal;
        break;
      case 'CATEGORY':
        for (const item of items) {
          if (rule.categories && rule.categories.includes(item.category)) {
            applicableAmount += item.price * item.quantity;
          }
        }
        break;
      case 'PRODUCT':
        const productIds = rule.products ? rule.products.map(p => p.toString()) : [];
        for (const item of items) {
          if (productIds.includes(item.product.toString())) {
            applicableAmount += item.price * item.quantity;
          }
        }
        break;
    }
    
    if (applicableAmount > 0) {
      let cashback = (applicableAmount * rule.percentage) / 100;
      
      if (rule.maxCashbackValue && cashback > rule.maxCashbackValue) {
        cashback = rule.maxCashbackValue;
      }
      
      totalCashback += cashback;
      expirationDays = rule.expirationDays || expirationDays;
    }
  }
  
  if (rules.length === 0) {
    totalCashback = (subtotal * settings.defaultPercentage) / 100;
  }
  
  for (const campaign of campaigns) {
    if (campaign.maxUsesPerUser && campaign.userUses) {
      const userUse = campaign.userUses.find(u => u.user.toString() === userId);
      if (userUse && userUse.count >= campaign.maxUsesPerUser) {
        continue;
      }
    }
    
    if (campaign.fixedPercentage) {
      totalCashback = (subtotal * campaign.fixedPercentage) / 100;
    } else if (campaign.multiplier) {
      totalCashback *= campaign.multiplier;
    }
    
    if (campaign.maxCashbackValue && totalCashback > campaign.maxCashbackValue) {
      totalCashback = campaign.maxCashbackValue;
    }
  }
  
  return { amount: Math.round(totalCashback * 100) / 100, expirationDays };
};
// ============================================
// VALIDAÇÃO DE CUPOM
// ============================================
const validateCouponForUser = async (code, orderTotal, userId, items = []) => {
  const now = new Date();
  
  console.log('🎫 Validando cupom:', { code, orderTotal, userId });

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { hasNoEndDate: true },
      { endDate: { $gte: now } }
    ]
  }).populate('applicableProducts');

  if (!coupon) {
    console.log('❌ Cupom não encontrado ou expirado');
    return { valid: false, message: 'Cupom inválido ou expirado', discount: 0 };
  }

  console.log('📋 Cupom encontrado:', {
    code: coupon.code,
    totalUsedCount: coupon.totalUsedCount,
    maxTotalUses: coupon.maxTotalUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    userUsesCount: coupon.userUses?.length || 0
  });

  // Verifica horário de funcionamento
  if (!isWithinSchedule(coupon.schedule)) {
    const scheduleMsg = getScheduleMessage(coupon.schedule);
    return { 
      valid: false, 
      message: scheduleMsg || 'Cupom fora do horário de funcionamento', 
      discount: 0 
    };
  }

  // Verifica limite total de usos
  if (coupon.maxTotalUses !== null && coupon.maxTotalUses !== undefined) {
    if (coupon.totalUsedCount >= coupon.maxTotalUses) {
      console.log('❌ Cupom esgotado:', coupon.totalUsedCount, '>=', coupon.maxTotalUses);
      return { valid: false, message: 'Cupom esgotado', discount: 0 };
    }
  }

  // Verifica limite de uso por usuário
  if (userId && coupon.maxUsesPerUser) {
    const userUse = coupon.userUses?.find(u => u.user.toString() === userId.toString());
    const userUseCount = userUse ? userUse.count : 0;
    
    console.log('👤 Verificando uso do usuário:', { 
      userId, 
      userUseCount, 
      maxUsesPerUser: coupon.maxUsesPerUser 
    });
    
    if (userUseCount >= coupon.maxUsesPerUser) {
      const message = coupon.maxUsesPerUser === 1 
        ? 'Você já utilizou este cupom.' 
        : `Você já usou este cupom ${userUseCount} vezes. Limite: ${coupon.maxUsesPerUser} uso(s).`;
      return { valid: false, message, discount: 0 };
    }
  }

  // Verifica tipo de cliente
  if (userId && coupon.customerType !== 'ALL') {
    const userOrderCount = await Order.countDocuments({ 
      user: userId, 
      status: { $nin: ['CANCELLED'] } 
    });
    
    if (coupon.customerType === 'NEW' && userOrderCount > 0) {
      return { valid: false, message: 'Cupom válido apenas para novos clientes', discount: 0 };
    }
    if (coupon.customerType === 'EXISTING' && userOrderCount === 0) {
      return { valid: false, message: 'Cupom válido apenas para clientes existentes', discount: 0 };
    }
    if (coupon.customerType === 'SPECIFIC' && coupon.specificCustomers) {
      const isSpecific = coupon.specificCustomers.some(c => c.toString() === userId.toString());
      if (!isSpecific) {
        return { valid: false, message: 'Cupom não disponível para sua conta', discount: 0 };
      }
    }
  }

  // Verifica valor mínimo do pedido
  if (orderTotal < coupon.minOrderValue) {
    return { 
      valid: false, 
      message: `Pedido mínimo de R$ ${coupon.minOrderValue.toFixed(2).replace('.', ',')}`, 
      discount: 0 
    };
  }

  // Calcula desconto
  let discount = 0;
  let freeShipping = false;
  let applicableTotal = orderTotal;

  if ((coupon.applicableCategories && coupon.applicableCategories.length > 0) || 
      (coupon.applicableProducts && coupon.applicableProducts.length > 0)) {
    applicableTotal = 0;
    for (const item of items) {
      const categoryMatch = coupon.applicableCategories && 
                           coupon.applicableCategories.includes(item.category);
      const productMatch = coupon.applicableProducts && 
                          coupon.applicableProducts.some(p => 
                            p._id ? p._id.toString() === item.product?.toString() : p.toString() === item.product?.toString()
                          );
      
      if (categoryMatch || productMatch) {
        applicableTotal += item.price * item.quantity;
      }
    }
    
    if (applicableTotal === 0 && 
        (!coupon.applicableCategories || coupon.applicableCategories.length === 0) && 
        (!coupon.applicableProducts || coupon.applicableProducts.length === 0)) {
      applicableTotal = orderTotal;
    }
  }

  switch (coupon.discountType) {
    case 'PERCENTAGE':
      discount = (applicableTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountValue && discount > coupon.maxDiscountValue) {
        discount = coupon.maxDiscountValue;
      }
      break;
    case 'FIXED':
      discount = Math.min(coupon.discountValue, applicableTotal);
      break;
    case 'FREE_SHIPPING':
      freeShipping = true;
      break;
  }

  console.log('✅ Cupom válido:', { discount, freeShipping });

  return { 
    valid: true, 
    message: 'Cupom aplicado com sucesso!', 
    discount: Math.round(discount * 100) / 100,
    freeShipping,
    coupon
  };
};

// ============================================
// FUNÇÃO PARA REGISTRAR USO DO CUPOM
// ============================================
const registerCouponUsage = async (couponCode, userId) => {
  const code = couponCode.toUpperCase().trim();
  
  console.log('📝 Registrando uso do cupom:', { code, userId });
  
  try {
    // Incrementa o contador total de usos
    await Coupon.updateOne(
      { code },
      { 
        $inc: { totalUsedCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Verifica se o usuário já usou este cupom
    const coupon = await Coupon.findOne({ code });
    
    if (!coupon) {
      console.log('❌ Cupom não encontrado para registro');
      return false;
    }
    
    const existingUserUse = coupon.userUses?.find(
      u => u.user.toString() === userId.toString()
    );
    
    if (existingUserUse) {
      // Usuário já usou - incrementa o contador
      await Coupon.updateOne(
        { code, 'userUses.user': userId },
        { 
          $inc: { 'userUses.$.count': 1 },
          $set: { 'userUses.$.lastUsedAt': new Date() }
        }
      );
      console.log('👤 Incrementado uso existente do usuário');
    } else {
      // Primeiro uso do usuário
      await Coupon.updateOne(
        { code },
        { 
          $push: { 
            userUses: {
              user: userId,
              count: 1,
              lastUsedAt: new Date()
            }
          }
        }
      );
      console.log('👤 Registrado primeiro uso do usuário');
    }
    
    // Log de confirmação
    const updatedCoupon = await Coupon.findOne({ code });
    console.log('✅ Cupom atualizado:', {
      code: updatedCoupon.code,
      totalUsedCount: updatedCoupon.totalUsedCount,
      userUses: updatedCoupon.userUses?.map(u => ({
        user: u.user.toString(),
        count: u.count
      }))
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao registrar uso do cupom:', error);
    return false;
  }
};

// ============================================
// RESOLVERS
// ============================================
const resolvers = {
  // ============================================
  // TYPE RESOLVERS
  // ============================================
  Courier: {
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`
  },

  Coupon: {
    applicableProducts: async (parent) => {
      if (!parent.applicableProducts || parent.applicableProducts.length === 0) return [];
      if (parent.applicableProducts[0]?.name) return parent.applicableProducts;
      return await Product.find({ _id: { $in: parent.applicableProducts } });
    },
    specificCustomers: async (parent) => {
      if (!parent.specificCustomers || parent.specificCustomers.length === 0) return [];
      if (parent.specificCustomers[0]?.name) return parent.specificCustomers;
      return await User.find({ _id: { $in: parent.specificCustomers } });
    },
    hasNoEndDate: (parent) => parent.hasNoEndDate || false,
    totalUsedCount: (parent) => parent.totalUsedCount || 0
  },

  CashbackRule: {
    products: async (parent) => {
      if (!parent.products || parent.products.length === 0) return [];
      return await Product.find({ _id: { $in: parent.products } });
    }
  },

  CashbackCampaign: {
    products: async (parent) => {
      if (!parent.products || parent.products.length === 0) return [];
      return await Product.find({ _id: { $in: parent.products } });
    },
    hasNoEndDate: (parent) => parent.hasNoEndDate || false
  },

  CashbackWallet: {
    user: async (parent) => {
      return await User.findById(parent.user);
    }
  },
  // ============================================
  // QUERIES
  // ============================================
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

    // COURIERS
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
      
      const totalCouriers = await Courier.countDocuments();
      const activeCouriers = await Courier.countDocuments({ isActive: true });
      
      const allCouriers = await Courier.find();
      const totalDeliveries = allCouriers.reduce((acc, c) => acc + c.totalDeliveries, 0);
      const totalEarnings = allCouriers.reduce((acc, c) => acc + c.totalEarnings, 0);
      
      const periodOrders = await Order.find({
        status: { $in: ['DELIVERED', 'COMPLETED'] },
        deliveryType: 'DELIVERY',
        courier: { $ne: null },
        updatedAt: { $gte: start, $lte: end }
      }).populate('courier');
      
      const periodDeliveries = periodOrders.length;
      const periodEarnings = periodOrders.reduce((acc, o) => acc + (o.shippingFee || 0), 0);
      
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
      
      const orderUserId = getUserId(order.user);
      if (user.role !== 'ADMIN' && orderUserId !== user.userId) {
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
    coupons: async (_, { onlyActive }, { user }) => {
      requireAdmin(user);
      const filter = {};
      if (onlyActive) {
        const now = new Date();
        filter.isActive = true;
        filter.startDate = { $lte: now };
        filter.$or = [
          { hasNoEndDate: true },
          { endDate: { $gte: now } }
        ];
      }
      
      const coupons = await Coupon.find(filter)
        .populate('applicableProducts')
        .populate('specificCustomers')
        .sort({ createdAt: -1 });
      
      return coupons;
    },

    coupon: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await Coupon.findById(id)
        .populate('applicableProducts')
        .populate('specificCustomers');
    },

    validateCoupon: async (_, { code, orderTotal, userId }, { user }) => {
      const userIdToUse = userId || user?.userId;
      return await validateCouponForUser(code, orderTotal, userIdToUse);
    },

    // CASHBACK - CLIENTE
    myCashbackWallet: async (_, __, { user }) => {
      requireAuth(user);
      return await getOrCreateWallet(user.userId);
    },

    // ============================================
    // CORRIGIDO: myCashbackSummary com lógica FIFO
    // ============================================
    myCashbackSummary: async (_, __, { user }) => {
      requireAuth(user);
      
      const settings = await getCashbackSettings();
      const wallet = await getOrCreateWallet(user.userId);
      
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // ============================================
      // CÁLCULO CORRETO DO PENDING EXPIRATION
      // Usa lógica FIFO: débitos consomem os créditos mais antigos primeiro
      // ============================================
      
      // 1. Separa transações de crédito (que podem expirar) e calcula valor restante
      const creditTransactions = wallet.transactions
        .filter(tx => tx.type === 'CREDIT' && tx.expiresAt && new Date(tx.expiresAt) > now)
        .map(tx => ({
          amount: tx.amount,
          expiresAt: new Date(tx.expiresAt),
          remainingAmount: tx.amount // Valor restante após débitos
        }))
        .sort((a, b) => a.expiresAt - b.expiresAt); // Ordena por expiração (mais antigos primeiro)
      
      // 2. Calcula total de débitos (cashback já usado)
      const totalDebits = wallet.transactions
        .filter(tx => tx.type === 'DEBIT' || tx.type === 'EXPIRED' || (tx.type === 'ADJUSTMENT' && tx.amount < 0))
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      // 3. Aplica os débitos nos créditos mais antigos (FIFO)
      let remainingDebits = totalDebits;
      
      for (const credit of creditTransactions) {
        if (remainingDebits <= 0) break;
        
        const amountToDeduct = Math.min(credit.remainingAmount, remainingDebits);
        credit.remainingAmount -= amountToDeduct;
        remainingDebits -= amountToDeduct;
      }
      
      // 4. Calcula pendingExpiration apenas dos créditos que ainda têm saldo
      //    E que expiram nos próximos 30 dias
      let pendingExpiration = 0;
      let nextExpirationDate = null;
      
      for (const credit of creditTransactions) {
        if (credit.remainingAmount > 0 && credit.expiresAt <= thirtyDaysFromNow) {
          pendingExpiration += credit.remainingAmount;
          
          if (!nextExpirationDate || credit.expiresAt < nextExpirationDate) {
            nextExpirationDate = credit.expiresAt;
          }
        }
      }
      
      // Garante que pendingExpiration nunca seja maior que o saldo atual
      pendingExpiration = Math.min(pendingExpiration, wallet.balance);
      
      // ============================================
      // BUSCA CAMPANHA ATIVA
      // ============================================
      const allCampaigns = await CashbackCampaign.find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
          { hasNoEndDate: true },
          { endDate: { $gte: now } }
        ]
      });
      
      const activeCampaign = allCampaigns.find(c => isWithinSchedule(c.schedule)) || null;
      
      return {
        balance: wallet.balance,
        pendingExpiration,
        nextExpirationDate: nextExpirationDate?.toISOString(),
        totalEarned: wallet.totalEarned,
        isEnabled: settings.isEnabled,
        currentCampaign: activeCampaign
      };
    },

    // CASHBACK - ADMIN
    cashbackRules: async (_, { onlyActive }, { user }) => {
      requireAdmin(user);
      const filter = {};
      if (onlyActive) filter.isActive = true;
      return await CashbackRule.find(filter).sort({ priority: -1 });
    },

    cashbackRule: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await CashbackRule.findById(id);
    },

    cashbackCampaigns: async (_, { onlyActive }, { user }) => {
      requireAdmin(user);
      const filter = {};
      if (onlyActive) {
        const now = new Date();
        filter.isActive = true;
        filter.startDate = { $lte: now };
        filter.$or = [
          { hasNoEndDate: true },
          { endDate: { $gte: now } }
        ];
      }
      return await CashbackCampaign.find(filter).sort({ startDate: -1 });
    },

    cashbackCampaign: async (_, { id }, { user }) => {
      requireAdmin(user);
      return await CashbackCampaign.findById(id);
    },

    cashbackSettings: async () => {
      return await getCashbackSettings();
    },

    cashbackReport: async (_, { startDate, endDate }, { user }) => {
      requireAdmin(user);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const wallets = await CashbackWallet.find();
      
      let totalCredited = 0;
      let totalDebited = 0;
      let totalExpired = 0;
      let transactionCount = 0;
      
      for (const wallet of wallets) {
        for (const tx of wallet.transactions) {
          const txDate = new Date(tx.createdAt);
          if (txDate >= start && txDate <= end) {
            transactionCount++;
            switch (tx.type) {
              case 'CREDIT':
              case 'ADJUSTMENT':
                if (tx.amount > 0) totalCredited += tx.amount;
                else totalDebited += Math.abs(tx.amount);
                break;
              case 'DEBIT':
                totalDebited += Math.abs(tx.amount);
                break;
              case 'EXPIRED':
                totalExpired += Math.abs(tx.amount);
                break;
            }
          }
        }
      }
      
      const activeWallets = wallets.filter(w => w.balance > 0).length;
      const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
      
      return {
        totalCredited,
        totalDebited,
        totalExpired,
        activeWallets,
        totalBalance,
        transactionCount
      };
    },

    activeCashbackCampaigns: async () => {
      const now = new Date();
      const allCampaigns = await CashbackCampaign.find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
          { hasNoEndDate: true },
          { endDate: { $gte: now } }
        ]
      });
      
      return allCampaigns.filter(c => isWithinSchedule(c.schedule));
    },

    // PREVIEW DO PEDIDO
    previewOrderDiscounts: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const { items, subtotal, shippingFee, couponCode, cashbackToUse, deliveryType } = input;
      const errors = [];
      
      let couponDiscount = 0;
      let freeShipping = false;
      let appliedCouponCode = null;
      
      if (couponCode) {
        const couponValidation = await validateCouponForUser(couponCode, subtotal, user.userId, items);
        if (couponValidation.valid) {
          couponDiscount = couponValidation.discount;
          freeShipping = couponValidation.freeShipping || false;
          appliedCouponCode = couponCode;
          
          if (cashbackToUse > 0 && !couponValidation.coupon.allowWithCashback) {
            errors.push('Este cupom não pode ser usado junto com cashback');
          }
        } else {
          errors.push(couponValidation.message);
        }
      }
      
      let cashbackUsed = 0;
      if (cashbackToUse > 0) {
        const settings = await getCashbackSettings();
        const wallet = await getOrCreateWallet(user.userId);
        
        if (!settings.isEnabled) {
          errors.push('Cashback está desabilitado no momento');
        } else if (cashbackToUse < settings.minRedeemValue) {
          errors.push(`Valor mínimo para resgate: R$ ${settings.minRedeemValue.toFixed(2)}`);
        } else if (cashbackToUse > wallet.balance) {
          errors.push('Saldo de cashback insuficiente');
        } else {
          const afterCoupon = subtotal - couponDiscount;
          const maxByPercentage = (afterCoupon * settings.maxRedeemPercentage) / 100;
          const maxAllowed = settings.maxRedeemValue 
            ? Math.min(maxByPercentage, settings.maxRedeemValue)
            : maxByPercentage;
          
          cashbackUsed = Math.min(cashbackToUse, maxAllowed, wallet.balance);
          
          if (cashbackToUse > maxAllowed) {
            errors.push(`Máximo de cashback permitido: R$ ${maxAllowed.toFixed(2)}`);
          }
        }
      }
      
      const actualShipping = freeShipping ? 0 : shippingFee;
      const total = Math.max(0, subtotal - couponDiscount - cashbackUsed + actualShipping);
      
      const usedCoupon = couponDiscount > 0;
      const usedCashback = cashbackUsed > 0;
      const cashbackEarn = await calculateCashbackToEarn(items, subtotal, user.userId, usedCoupon, usedCashback);
      
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + cashbackEarn.expirationDays);
      
      return {
        subtotal,
        couponDiscount,
        couponCode: appliedCouponCode,
        freeShipping,
        cashbackUsed,
        shippingFee: actualShipping,
        total,
        cashbackToEarn: cashbackEarn.amount,
        cashbackToEarnExpiration: expirationDate.toISOString(),
        errors
      };
    },

    // VALIDAÇÃO DE ENDEREÇO
    validateDeliveryAddress: async (_, { city, state }) => {
      const isValid = validateDeliveryArea(city, state);
      
      if (!isValid) {
        return {
          valid: false,
          message: 'Desculpe, nosso delivery atende apenas a cidade de Campina Grande - PB.',
          allowedCity: 'Campina Grande',
          allowedState: 'PB'
        };
      }
      
      return {
        valid: true,
        message: 'Endereço dentro da área de entrega!',
        allowedCity: 'Campina Grande',
        allowedState: 'PB'
      };
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
  // ============================================
  // MUTATIONS
  // ============================================
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
      await getOrCreateWallet(user.id);

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
      
      if (!validateDeliveryArea(input.city, input.state)) {
        throwDeliveryAreaError();
      }
      
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
      
      if (input.city || input.state) {
        const dbUser = await User.findById(user.userId);
        const currentAddress = dbUser.addresses.find(addr => addr._id.toString() === addressId);
        
        const cityToValidate = input.city || currentAddress?.city;
        const stateToValidate = input.state || currentAddress?.state;
        
        if (!validateDeliveryArea(cityToValidate, stateToValidate)) {
          throwDeliveryAreaError();
        }
      }
      
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

    // COURIERS
    createCourier: async (_, { input }, { user }) => {
      requireAdmin(user);
      
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

    // ============================================
    // ORDERS
    // ============================================
    createOrder: async (_, { input }, { user }) => {
      requireAuth(user);
      
      console.log('🛒 ========================================');
      console.log('🛒 CRIANDO NOVO PEDIDO');
      console.log('🛒 Usuário:', user.userId);
      console.log('🛒 ========================================');
      
      // Validação de área de entrega
      if (input.deliveryType === 'DELIVERY' && input.deliveryAddress) {
        const { city, state } = input.deliveryAddress;
        if (!validateDeliveryArea(city, state)) {
          throwDeliveryAreaError();
        }
      }
      
      let discount = input.discount || 0;
      let cashbackUsed = 0;
      let cashbackEarned = 0;
      let freeShipping = false;
      let appliedCouponCode = null;
      
      // ============================================
      // PROCESSAMENTO DO CUPOM
      // ============================================
      if (input.couponCode) {
        console.log('🎫 Processando cupom:', input.couponCode);
        
        const couponValidation = await validateCouponForUser(
          input.couponCode, 
          input.subtotal, 
          user.userId, 
          input.items
        );
        
        if (!couponValidation.valid) {
          console.log('❌ Cupom inválido:', couponValidation.message);
          throw new Error(couponValidation.message);
        }
        
        discount = couponValidation.discount;
        freeShipping = couponValidation.freeShipping || false;
        appliedCouponCode = input.couponCode.toUpperCase().trim();
        
        console.log('✅ Cupom válido! Desconto:', discount, 'Frete grátis:', freeShipping);
        
        const usageRegistered = await registerCouponUsage(appliedCouponCode, user.userId);
        
        if (!usageRegistered) {
          console.log('⚠️ Aviso: Falha ao registrar uso do cupom, mas pedido continuará');
        }
      }
      
      // ============================================
      // PROCESSAMENTO DO CASHBACK (USO)
      // ============================================
      if (input.cashbackToUse > 0) {
        console.log('💰 Processando uso de cashback:', input.cashbackToUse);
        
        const settings = await getCashbackSettings();
        
        if (!settings.isEnabled) {
          throw new Error('Cashback está desabilitado no momento');
        }
        
        const wallet = await getOrCreateWallet(user.userId);
        
        if (input.cashbackToUse > wallet.balance) {
          throw new Error('Saldo de cashback insuficiente');
        }
        
        if (input.cashbackToUse < settings.minRedeemValue) {
          throw new Error(`Valor mínimo para resgate: R$ ${settings.minRedeemValue.toFixed(2)}`);
        }
        
        const afterCoupon = input.subtotal - discount;
        const maxByPercentage = (afterCoupon * settings.maxRedeemPercentage) / 100;
        const maxAllowed = settings.maxRedeemValue 
          ? Math.min(maxByPercentage, settings.maxRedeemValue)
          : maxByPercentage;
        
        cashbackUsed = Math.min(input.cashbackToUse, maxAllowed, wallet.balance);
        
        // Debita o cashback da carteira
        wallet.balance -= cashbackUsed;
        wallet.totalUsed += cashbackUsed;
        wallet.transactions.push({
          type: 'DEBIT',
          amount: -cashbackUsed,
          description: `Resgate em pedido`,
          createdAt: new Date()
        });
        
        await wallet.save();
        console.log('💳 Cashback debitado:', cashbackUsed);
      }
      
      // ============================================
      // CÁLCULO DO CASHBACK A GANHAR
      // ============================================
      const usedCoupon = discount > 0;
      const usedCashbackForPayment = cashbackUsed > 0;
      
      const cashbackCalc = await calculateCashbackToEarn(
        input.items, 
        input.subtotal, 
        user.userId, 
        usedCoupon, 
        usedCashbackForPayment
      );
      
      cashbackEarned = cashbackCalc.amount;
      console.log('🎁 Cashback a ganhar:', cashbackEarned);
      
      // ============================================
      // CÁLCULO DO TOTAL FINAL
      // ============================================
      const actualShipping = freeShipping ? 0 : input.shippingFee;
      const finalTotal = Math.max(0, input.subtotal - discount - cashbackUsed + actualShipping);
      
      console.log('📊 Resumo do pedido:', {
        subtotal: input.subtotal,
        discount,
        cashbackUsed,
        shippingFee: actualShipping,
        freeShipping,
        total: finalTotal,
        cashbackEarned
      });
      
      // ============================================
      // CRIAÇÃO DO PEDIDO
      // ============================================
      const order = new Order({
        user: user.userId,
        items: input.items,
        subtotal: input.subtotal,
        shippingFee: actualShipping,
        discount: discount,
        cashbackUsed: cashbackUsed,
        cashbackEarned: cashbackEarned,
        total: finalTotal,
        couponCode: appliedCouponCode,
        deliveryType: input.deliveryType,
        deliveryAddress: input.deliveryAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'PIX' ? 'PENDING' : 'PENDING',
        status: 'PLACED',
        statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
      });
      
      await order.save();
      console.log('✅ Pedido criado com sucesso:', order._id);
      
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
      
      // Atualiza status de pagamento se necessário
      if (['DELIVERED', 'PICKED_UP', 'COMPLETED'].includes(status)) {
        if (['CASH', 'CARD_ON_DELIVERY'].includes(order.paymentMethod)) {
          order.paymentStatus = 'PAID';
        }
      }
      
      await order.save();
      
      return await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    assignCourier: async (_, { orderId, courierId }, { user }) => {
      requireAdmin(user);
      
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Pedido não encontrado');
      
      const courier = await Courier.findById(courierId);
      if (!courier) throw new Error('Entregador não encontrado');
      
      if (!courier.isActive) {
        throw new Error('Este entregador está inativo');
      }
      
      order.courier = courierId;
      
      if (order.status === 'READY' || order.status === 'PREPARING') {
        order.status = 'OUT_FOR_DELIVERY';
        order.statusHistory.push({ status: 'OUT_FOR_DELIVERY', timestamp: new Date() });
      }
      
      await order.save();
      
      return await Order.findById(orderId)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    // ============================================
    // CLIENTE confirma que RECEBEU o pedido
    // ============================================
    confirmOrderReceived: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const order = await Order.findById(id);
      if (!order) throw new Error('Pedido não encontrado');
      
      // Verifica se o pedido pertence ao usuário
      const orderUserId = getUserId(order.user);
      if (user.role !== 'ADMIN' && orderUserId !== user.userId) {
        throw new Error('Não autorizado');
      }
      
      // Verifica se o pedido está no status correto para confirmação
      const allowedStatuses = ['DELIVERED', 'PICKED_UP', 'READY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'];
      if (!allowedStatuses.includes(order.status)) {
        throw new Error('Pedido ainda não está pronto para confirmação');
      }
      
      // Verifica se já foi confirmado
      if (order.status === 'COMPLETED') {
        throw new Error('Pedido já foi confirmado');
      }
      
      const previousStatus = order.status;
      
      // Atualiza para COMPLETED
      order.status = 'COMPLETED';
      order.customerConfirmedAt = new Date();
      order.statusHistory.push({ status: 'COMPLETED', timestamp: new Date() });
      
      // Atualiza status de pagamento se necessário
      if (['CASH', 'CARD_ON_DELIVERY'].includes(order.paymentMethod)) {
        order.paymentStatus = 'PAID';
      }
      
      // Credita cashback se ainda não foi creditado
      if (order.cashbackEarned > 0) {
        const wallet = await getOrCreateWallet(order.user);
        
        // Verifica se já não creditou (evita duplicação)
        const alreadyCredited = wallet.transactions.some(
          t => t.orderId?.toString() === order._id.toString() && t.type === 'CREDIT'
        );
        
        if (!alreadyCredited) {
          const settings = await getCashbackSettings();
          
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + settings.defaultExpirationDays);
          
          wallet.balance += order.cashbackEarned;
          wallet.totalEarned += order.cashbackEarned;
          wallet.transactions.push({
            type: 'CREDIT',
            amount: order.cashbackEarned,
            description: `Cashback do pedido #${order._id.toString().slice(-6)}`,
            orderId: order._id,
            expiresAt: expirationDate,
            createdAt: new Date()
          });
          
          await wallet.save();
          console.log('💰 Cashback creditado ao cliente:', order.cashbackEarned);
        }
      }
      
      // Atualiza métricas do entregador se for delivery
      if (order.courier && order.deliveryType === 'DELIVERY' && previousStatus !== 'COMPLETED') {
        console.log('📊 Atualizando métricas do entregador');
      }
      
      await order.save();
      console.log('✅ Pedido confirmado pelo cliente:', order._id);
      
      return await Order.findById(id)
        .populate('user')
        .populate('items.product')
        .populate('courier');
    },

    // ============================================
    // ADMIN confirma entrega/retirada
    // ============================================
    confirmDelivery: async (_, { id }, { user }) => {
      requireAdmin(user);
      
      const order = await Order.findById(id);
      if (!order) throw new Error('Pedido não encontrado');
      
      if (order.deliveryType === 'PICKUP') {
        order.status = 'PICKED_UP';
        order.statusHistory.push({ status: 'PICKED_UP', timestamp: new Date() });
      } else {
        order.status = 'DELIVERED';
        order.statusHistory.push({ status: 'DELIVERED', timestamp: new Date() });
      }
      
      if (['CASH', 'CARD_ON_DELIVERY'].includes(order.paymentMethod)) {
        order.paymentStatus = 'PAID';
      }
      
      // Credita cashback
      if (order.cashbackEarned > 0) {
        const wallet = await getOrCreateWallet(order.user);
        
        const alreadyCredited = wallet.transactions.some(
          t => t.orderId?.toString() === order._id.toString() && t.type === 'CREDIT'
        );
        
        if (!alreadyCredited) {
          const settings = await getCashbackSettings();
          
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + settings.defaultExpirationDays);
          
          wallet.balance += order.cashbackEarned;
          wallet.totalEarned += order.cashbackEarned;
          wallet.transactions.push({
            type: 'CREDIT',
            amount: order.cashbackEarned,
            description: `Cashback do pedido #${order._id.toString().slice(-6)}`,
            orderId: order._id,
            expiresAt: expirationDate,
            createdAt: new Date()
          });
          
          await wallet.save();
        }
      }
      
      // Atualiza métricas do entregador
      if (order.courier && order.deliveryType === 'DELIVERY') {
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

    // PROMOTIONS
    createPromotion: async (_, { input }, { user }) => {
      requireAdmin(user);
      const promotion = new Promotion({
        ...input,
        isActive: input.isActive !== false
      });
      return await promotion.save();
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
      await Promotion.findByIdAndDelete(id);
      return true;
    },

    // COUPONS
    createCoupon: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const existingCoupon = await Coupon.findOne({ 
        code: input.code.toUpperCase().trim() 
      });
      if (existingCoupon) {
        throw new Error('Já existe um cupom com este código');
      }
      
      const coupon = new Coupon({
        ...input,
        code: input.code.toUpperCase().trim(),
        minOrderValue: input.minOrderValue || 0,
        maxUsesPerUser: input.maxUsesPerUser || 1,
        customerType: input.customerType || 'ALL',
        allowWithCashback: input.allowWithCashback !== false,
        allowStacking: input.allowStacking || false,
        hasNoEndDate: input.hasNoEndDate || false,
        totalUsedCount: 0,
        userUses: [],
        isActive: input.isActive !== false
      });
      
      return await coupon.save();
    },

    updateCoupon: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      
      if (input.code) {
        const existingCoupon = await Coupon.findOne({ 
          code: input.code.toUpperCase().trim(),
          _id: { $ne: id }
        });
        if (existingCoupon) {
          throw new Error('Já existe um cupom com este código');
        }
        input.code = input.code.toUpperCase().trim();
      }
      
      return await Coupon.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      ).populate('applicableProducts').populate('specificCustomers');
    },

    deleteCoupon: async (_, { id }, { user }) => {
      requireAdmin(user);
      await Coupon.findByIdAndDelete(id);
      return true;
    },

    toggleCouponActive: async (_, { id }, { user }) => {
      requireAdmin(user);
      const coupon = await Coupon.findById(id);
      if (!coupon) throw new Error('Cupom não encontrado');
      
      coupon.isActive = !coupon.isActive;
      return await coupon.save();
    },

    // CASHBACK RULES
    createCashbackRule: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const rule = new CashbackRule({
        ...input,
        expirationDays: input.expirationDays || 30,
        allowEarnOnCashbackPayment: input.allowEarnOnCashbackPayment !== false,
        allowEarnWithCoupon: input.allowEarnWithCoupon !== false,
        priority: input.priority || 0,
        isActive: input.isActive !== false
      });
      
      return await rule.save();
    },

    updateCashbackRule: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await CashbackRule.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteCashbackRule: async (_, { id }, { user }) => {
      requireAdmin(user);
      await CashbackRule.findByIdAndDelete(id);
      return true;
    },

    toggleCashbackRuleActive: async (_, { id }, { user }) => {
      requireAdmin(user);
      const rule = await CashbackRule.findById(id);
      if (!rule) throw new Error('Regra não encontrada');
      
      rule.isActive = !rule.isActive;
      return await rule.save();
    },

    // CASHBACK CAMPAIGNS
    createCashbackCampaign: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      const campaign = new CashbackCampaign({
        ...input,
        hasNoEndDate: input.hasNoEndDate || false,
        isActive: input.isActive !== false
      });
      
      return await campaign.save();
    },

    updateCashbackCampaign: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await CashbackCampaign.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
    },

    deleteCashbackCampaign: async (_, { id }, { user }) => {
      requireAdmin(user);
      await CashbackCampaign.findByIdAndDelete(id);
      return true;
    },

    toggleCashbackCampaignActive: async (_, { id }, { user }) => {
      requireAdmin(user);
      const campaign = await CashbackCampaign.findById(id);
      if (!campaign) throw new Error('Campanha não encontrada');
      
      campaign.isActive = !campaign.isActive;
      return await campaign.save();
    },

    // CASHBACK SETTINGS
    updateCashbackSettings: async (_, { input }, { user }) => {
      requireAdmin(user);
      
      let settings = await CashbackSettings.findOne();
      
      if (!settings) {
        settings = new CashbackSettings(input);
      } else {
        Object.assign(settings, input);
      }
      
      settings.updatedAt = new Date();
      return await settings.save();
    },

    // CASHBACK WALLET - ADMIN
    adjustCashbackBalance: async (_, { userId, amount, description }, { user }) => {
      requireAdmin(user);
      
      const wallet = await getOrCreateWallet(userId);
      
      wallet.balance += amount;
      if (amount > 0) {
        wallet.totalEarned += amount;
      } else {
        wallet.totalUsed += Math.abs(amount);
      }
      
      wallet.transactions.push({
        type: 'ADJUSTMENT',
        amount,
        description: description || 'Ajuste manual',
        createdAt: new Date()
      });
      
      return await wallet.save();
    },

    expireCashback: async (_, __, { user }) => {
      requireAdmin(user);
      
      const now = new Date();
      const wallets = await CashbackWallet.find();
      
      let totalExpired = 0;
      let walletsAffected = 0;
      
      for (const wallet of wallets) {
        let expiredAmount = 0;
        
        for (const tx of wallet.transactions) {
          if (tx.type === 'CREDIT' && tx.expiresAt && new Date(tx.expiresAt) < now) {
            // Marca como expirado
            expiredAmount += tx.amount;
          }
        }
        
        if (expiredAmount > 0) {
          wallet.balance = Math.max(0, wallet.balance - expiredAmount);
          wallet.totalExpired += expiredAmount;
          wallet.transactions.push({
            type: 'EXPIRED',
            amount: -expiredAmount,
            description: 'Cashback expirado',
            createdAt: new Date()
          });
          
          await wallet.save();
          totalExpired += expiredAmount;
          walletsAffected++;
        }
      }
      
      return {
        success: true,
        message: `Expirado R$ ${totalExpired.toFixed(2)} de ${walletsAffected} carteiras`
      };
    }
  }
};

module.exports = resolvers;

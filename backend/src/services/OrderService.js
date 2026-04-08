const Order = require('../models/Order');

class OrderService {
  async getAllOrders(limit = 10, offset = 0, status = null, userId = null, role = 'USER') {
    const query = {};
    if (status) query.status = status;
    if (role !== 'ADMIN') query.user = userId; 

    return await Order.find(query)
      .populate('items.product')
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  async getOrderById(id, userId, role) {
    const order = await Order.findById(id).populate('items.product').populate('user');
    if (!order) throw new Error('Pedido não encontrado');
    if (role !== 'ADMIN' && order.user._id.toString() !== userId) throw new Error('Não autorizado');
    return order;
  }

  async createOrder(orderData, userId) {
    const order = new Order({
      ...orderData,
      user: userId
    });
    return await order.save();
  }

  async updateOrderStatus(id, status) {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('items.product')
      .populate('user');
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  }

  async getDashboardMetrics() {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    return { totalOrders, pendingOrders, totalRevenue };
  }
}

module.exports = new OrderService();
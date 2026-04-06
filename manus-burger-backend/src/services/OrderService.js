const Order = require('../models/Order');

class OrderService {
  async getAllOrders(limit = 10, offset = 0) {
    return await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  async createOrder(orderData, userId) {
    const order = new Order({
      ...orderData,
      user: userId
    });
    return await order.save();
  }
}

module.exports = new OrderService();
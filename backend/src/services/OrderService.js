const Order = require('../models/Order');

// Serviço responsável pela lógica de pedidos
class OrderService {
  // Lista pedidos com filtros e paginação
  async getAllOrders(limit = 10, offset = 0, status = null, userId = null, role = 'USER') {
    const query = {};
    if (status) query.status = status;
    // Cliente só vê os próprios pedidos; admin vê todos
    if (role !== 'ADMIN') query.user = userId; 

    return await Order.find(query)
      .populate('items.product')
      .populate('user')  
      .sort({ createdAt: -1 }) 
      .skip(offset)
      .limit(limit);
  }

  // Busca um pedido específico por ID, com verificação de permissão
  async getOrderById(id, userId, role) {
    const order = await Order.findById(id).populate('items.product').populate('user');
    if (!order) throw new Error('Pedido não encontrado');
    // Cliente só acessa o próprio pedido; admin acessa todos
    if (role !== 'ADMIN' && order.user._id.toString() !== userId) throw new Error('Não autorizado');
    return order;
  }

  // Cria um novo pedido para o usuário autenticado
  async createOrder(orderData, userId) {
    const order = new Order({
      ...orderData,
      user: userId
    });
    return await order.save();
  }

  // Atualiza o status de um pedido (uso administrativo)
  async updateOrderStatus(id, status) {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('items.product')
      .populate('user');
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  }

  // Retorna métricas básicas para dashboard (total de pedidos, pendentes, receita)
  async getDashboardMetrics() {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    
    // Soma dos totais de pedidos não cancelados
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    return { totalOrders, pendingOrders, totalRevenue };
  }
}

// Exporta uma instância única do serviço
module.exports = new OrderService();
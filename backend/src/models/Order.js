const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  
  // Valores
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  
  // Cupom aplicado
  couponCode: { type: String },
  
  // Entrega
  deliveryType: { 
    type: String, 
    enum: ['DELIVERY', 'PICKUP'], 
    required: true 
  },
  deliveryAddress: {
    label: String,
    zipCode: String,
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String
  },
  
  // Pagamento
  paymentMethod: { 
    type: String, 
    enum: [
      'CREDIT_CARD', 
      'DEBIT_CARD', 
      'PIX', 
      'APPLE_PAY', 
      'GOOGLE_PAY',
      'CASH',
      'CARD_ON_DELIVERY'
    ], 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  
  // Status do pedido
  status: {
    type: String,
    enum: [
      'PLACED',      // Pedido realizado
      'CONFIRMED',   // Pedido confirmado
      'PREPARING',   // Em produção
      'OUT_FOR_DELIVERY', // Em processo de entrega
      'DELIVERED',   // Entrega finalizada
      'COMPLETED',   // Cliente confirmou recebimento
      'CANCELLED'
    ],
    default: 'PLACED',
    index: true
  },
  
  // Timestamps de cada status
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Cliente confirmou recebimento
  customerConfirmedAt: { type: Date }
  
}, { timestamps: true });

// Index composto para queries frequentes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
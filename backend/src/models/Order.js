const mongoose = require('mongoose');

// Sub-schema para itens do pedido
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

// Sub-schema para endereço de entrega
const addressSchema = new mongoose.Schema({
  label: String,
  zipCode: String,
  street: String,
  number: String,
  complement: String,
  neighborhood: String,
  city: String,
  state: String,
  isDefault: Boolean
});

// Sub-schema para histórico de status
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Schema principal
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String },
  deliveryType: { 
    type: String, 
    enum: ['DELIVERY', 'PICKUP'],
    required: true 
  },
  deliveryAddress: addressSchema,
  paymentMethod: { 
    type: String, 
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH', 'CARD_ON_DELIVERY'],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  status: { 
    type: String, 
    enum: [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'READY_FOR_PICKUP',
      'DELIVERED',
      'PICKED_UP',
      'COMPLETED',
      'CANCELLED'
    ], 
    default: 'PLACED' 
  },
  statusHistory: [statusHistorySchema],
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier' }, // Referência ao entregador
  customerConfirmedAt: { type: Date }
}, { timestamps: true });

// Índices
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ courier: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

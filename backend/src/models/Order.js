const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

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

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

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
      'OUT_FOR_DELIVERY',   // Apenas para DELIVERY
      'READY_FOR_PICKUP',   // Apenas para PICKUP
      'DELIVERED',          // Apenas para DELIVERY
      'PICKED_UP',          // Apenas para PICKUP
      'COMPLETED', 
      'CANCELLED'
    ], 
    default: 'PLACED' 
  },
  statusHistory: [statusHistorySchema],
  customerConfirmedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

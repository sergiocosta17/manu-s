const mongoose = require('mongoose');

// Sub-schema para itens do pedido
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Referência ao produto original
  name: { type: String, required: true },                            // Nome do produto no momento do pedido
  price: { type: Number, required: true },                           // Preço unitário no momento do pedido
  quantity: { type: Number, required: true }                         // Quantidade do item
});

// Sub-schema para endereço de entrega (embutido no pedido)
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

// Sub-schema para histórico de status do pedido
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },      // Status registrado
  timestamp: { type: Date, default: Date.now }   // Data/hora da mudança
});

// Schema principal do modelo Order
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Cliente que fez o pedido
  items: [orderItemSchema],                                                      // Itens do pedido
  subtotal: { type: Number, required: true },                                    // Soma dos itens antes de frete e desconto
  shippingFee: { type: Number, default: 0 },                                     // Taxa de entrega
  discount: { type: Number, default: 0 },                                        // Valor do desconto aplicado
  total: { type: Number, required: true },                                       // Valor total final (subtotal + frete - desconto)
  couponCode: { type: String },                                                  // Código do cupom utilizado
  deliveryType: { 
    type: String, 
    enum: ['DELIVERY', 'PICKUP'],                                                // Tipo de entrega: delivery ou retirada
    required: true 
  },
  deliveryAddress: addressSchema,                                                // Endereço de entrega
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
      'PLACED',              // Pedido realizado
      'CONFIRMED',           // Confirmado pela loja
      'PREPARING',           // Em preparação
      'OUT_FOR_DELIVERY',    // Saiu para entrega (apenas para DELIVERY)
      'READY_FOR_PICKUP',    // Pronto para retirada (apenas para RETIRADA)
      'DELIVERED',           // Entregue (apenas para DELIVERY)
      'PICKED_UP',           // Retirado pelo cliente (apenas para RETIRADA)
      'COMPLETED',           // Finalizado (após confirmação do cliente)
      'CANCELLED'            // Cancelado
    ], 
    default: 'PLACED' 
  },
  statusHistory: [statusHistorySchema],      // Histórico de alterações de status
  customerConfirmedAt: { type: Date }        // Data/hora em que o cliente confirmou recebimento/retirada
}, { timestamps: true });                    // Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Loja' },
  zipCode: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  complement: { type: String },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: true }
});

const paymentMethodSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'APPLE_PAY', 'GOOGLE_PAY'], 
    required: true 
  },
  label: { type: String },
  cardLast4: { type: String },
  cardBrand: { type: String },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  phone: { type: String },
  birthDate: { type: String },
  avatarUrl: { type: String },
  
  // ==================== Campos específicos do ADMIN (loja) ====================
  storeName: { type: String, default: '' },
  storeAddress: { type: addressSchema },  // ✅ Objeto estruturado
  storePhone: { type: String, default: '' },
  
  // ==================== Campos do cliente ====================
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema]
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

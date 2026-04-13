const mongoose = require('mongoose');

// Sub-schema para endereço (usado tanto para cliente quanto para a loja admin)
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

// Sub-schema para métodos de pagamento salvos do cliente
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

// Schema principal do modelo User (clientes e administradores)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }, 
  phone: { type: String }, 
  birthDate: { type: String },  
  avatarUrl: { type: String }, 
  
  // Campos específicos do ADMIN (loja)
  storeName: { type: String, default: '' },  
  storeAddress: { type: addressSchema },  
  storePhone: { type: String, default: '' },  
  
  // Campos do cliente
  addresses: [addressSchema],  
  paymentMethods: [paymentMethodSchema]  
  
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('User', userSchema);
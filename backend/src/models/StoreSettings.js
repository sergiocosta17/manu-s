const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  // Nome da loja
  storeName: { type: String, default: null },
  
  // Endereço completo da loja
  storeAddress: { type: String, default: null },
  
  // Telefone de contato
  storePhone: { type: String, default: null },
  
  // Horário de funcionamento (texto livre)
  businessHours: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
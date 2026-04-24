const mongoose = require('mongoose');

// Sub-schema para informações do veículo
const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },      // Marca do veículo
  model: { type: String, required: true },      // Modelo do veículo
  plate: { type: String, required: true },      // Placa do veículo
  year: { type: Number, required: true },       // Ano do veículo
  color: { type: String, required: true }       // Cor do veículo
});

// Schema principal do modelo Courier (Entregador)
const courierSchema = new mongoose.Schema({
  firstName: { type: String, required: true },          // Nome
  lastName: { type: String, required: true },           // Sobrenome
  phone: { type: String, required: true },              // Telefone
  email: { type: String, required: true, unique: true }, // E-mail
  cpf: { type: String, required: true, unique: true },   // CPF
  vehicle: { type: vehicleSchema, required: true },      // Informações do veículo
  isActive: { type: Boolean, default: true },            // Se está ativo
  totalDeliveries: { type: Number, default: 0 },         // Total de entregas realizadas
  totalEarnings: { type: Number, default: 0 }            // Total faturado (taxas de entrega)
}, { timestamps: true });

// Índices para busca
courierSchema.index({ email: 1 });
courierSchema.index({ cpf: 1 });
courierSchema.index({ isActive: 1 });

module.exports = mongoose.model('Courier', courierSchema);

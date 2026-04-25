const mongoose = require('mongoose');

// Sub-schema para informações do veículo
const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  plate: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String, required: true }
});

// Schema principal do modelo Courier (Entregador)
const courierSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true, unique: true },
  vehicle: { type: vehicleSchema, required: true },
  isActive: { type: Boolean, default: true },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 }
}, { timestamps: true });

courierSchema.index({ isActive: 1 });

module.exports = mongoose.model('Courier', courierSchema);
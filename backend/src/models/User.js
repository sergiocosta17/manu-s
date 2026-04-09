const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  phone: { type: String },
  birthDate: { type: String },
  avatarUrl: { type: String },
  storeName: { type: String },
  pickupAddress: { type: String },
  addresses: { type: String, default: '[]' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
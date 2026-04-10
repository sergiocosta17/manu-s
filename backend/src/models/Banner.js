const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },
  
  // Campo para diferenciar banners
  location: {
    type: String,
    enum: ['HOME', 'OFFERS'],
    default: 'HOME'
  },
  
  // Ordem de exibição
  order: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, { timestamps: true });

bannerSchema.index({ location: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
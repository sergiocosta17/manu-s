const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  imageUrl: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Banner', bannerSchema);
const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: null
  },
  storeAddress: {
    type: String,
    default: null
  },
  storePhone: {
    type: String,
    default: null
  },
  businessHours: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

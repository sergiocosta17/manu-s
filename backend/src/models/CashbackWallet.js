const mongoose = require('mongoose');

const cashbackTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT', 'EXPIRED', 'ADJUSTMENT'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const cashbackWalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalUsed: {
    type: Number,
    default: 0
  },
  totalExpired: {
    type: Number,
    default: 0
  },
  transactions: [cashbackTransactionSchema]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CashbackWallet', cashbackWalletSchema);
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

tokenBlacklistSchema.index({ token: 1 }, { unique: true });
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;

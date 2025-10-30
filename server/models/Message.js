const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEncrypted: {
    type: Boolean,
    default: false,
  },
  ciphertext: {
    type: String,
  },
  nonce: {
    type: String,
  },
});

module.exports = mongoose.model('Message', messageSchema);

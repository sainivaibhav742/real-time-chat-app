const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Update user public key
router.post('/public-key', authenticateToken, async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ message: 'Public key is required' });
    }

    await User.findByIdAndUpdate(req.user.id, { publicKey });
    res.json({ message: 'Public key updated successfully' });
  } catch (error) {
    console.error('Error updating public key:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room members
router.get('/room/:roomId/members', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    // For now, we'll assume all users are in all rooms
    // In a real app, you'd have a proper room membership system
    const users = await User.find({}, 'username publicKey');
    res.json(users);
  } catch (error) {
    console.error('Error fetching room members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join room (initialize room key distribution)
router.post('/room/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { roomKey } = req.body;

    if (!roomKey) {
      return res.status(400).json({ message: 'Room key is required' });
    }

    // Get all room members
    const users = await User.find({}, 'username publicKey');

    // Encrypt room key for each member using their public key
    const crypto = require('crypto-js');
    const encryptedKeys = {};

    for (const user of users) {
      // In production, use proper asymmetric encryption
      // For now, using symmetric encryption as placeholder
      const encryptedKey = crypto.AES.encrypt(roomKey, user.publicKey).toString();
      encryptedKeys[user._id] = encryptedKey;
    }

    res.json({ encryptedKeys });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

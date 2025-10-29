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

    // Update user's public key
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { publicKey },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Public key updated successfully',
      publicKey: user.publicKey
    });
  } catch (error) {
    console.error('Public key update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room members' public keys
router.get('/room-members/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Find room and get member user IDs
    const room = await Room.findOne({ name: roomId }).populate('members.userId', 'username publicKey');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Extract public keys of room members
    const members = room.members.map(member => ({
      userId: member.userId._id,
      username: member.userId.username,
      publicKey: member.userId.publicKey
    })).filter(member => member.publicKey); // Only include users with public keys

    res.json({ members });
  } catch (error) {
    console.error('Room members fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or join room
router.post('/join-room', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Find or create room
    let room = await Room.findOne({ name: roomId });
    if (!room) {
      room = new Room({ name: roomId, members: [] });
    }

    // Check if user is already a member
    const isMember = room.members.some(member =>
      member.userId.toString() === req.user.userId
    );

    if (!isMember) {
      room.members.push({ userId: req.user.userId });
      await room.save();
    }

    res.json({
      message: 'Joined room successfully',
      roomId: room.name,
      memberCount: room.members.length
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

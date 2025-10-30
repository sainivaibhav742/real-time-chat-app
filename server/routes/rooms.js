const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Helper function to get user ID from token
const getUserIdFromToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded.id || decoded.userId;
  } catch (error) {
    return null;
  }
};

// Get all rooms for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const rooms = await Room.find({
      'members.userId': userId
    }).populate('members.userId', 'username email');

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Check if room name already exists
    const existingRoom = await Room.findOne({ name: name.trim() });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = new Room({
      name: name.trim(),
      members: [{
        userId: req.user.id || req.user.userId,
        joinedAt: new Date()
      }]
    });

    await room.save();
    await room.populate('members.userId', 'username email');

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join an existing room
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is already a member
    const isMember = room.members.some(member =>
      member.userId.toString() === (req.user.id || req.user.userId)
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    room.members.push({
      userId: req.user.id || req.user.userId,
      joinedAt: new Date()
    });

    await room.save();
    await room.populate('members.userId', 'username email');

    res.json(room);
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a room
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Find and remove the user from members
    const memberIndex = room.members.findIndex(member =>
      member.userId.toString() === (req.user.id || req.user.userId)
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this room' });
    }

    room.members.splice(memberIndex, 1);

    // If no members left, delete the room
    if (room.members.length === 0) {
      await Room.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Room deleted as no members remain' });
    }

    await room.save();
    await room.populate('members.userId', 'username email');

    res.json(room);
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search rooms by name
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const rooms = await Room.find({
      name: { $regex: q.trim(), $options: 'i' }
    }).populate('members.userId', 'username email');

    res.json(rooms);
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

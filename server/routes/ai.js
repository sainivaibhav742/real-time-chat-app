const express = require('express');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to verify JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// AI Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, roomId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Create a conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant in a real-time chat application. Keep responses concise and friendly.'
      },
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      message: aiResponse,
      sender: 'AI Assistant',
      timestamp: new Date(),
      roomId: roomId || 'general'
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
});

module.exports = router;

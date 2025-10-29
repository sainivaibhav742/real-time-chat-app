const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      // Check if message is for AI
      if (data.content.toLowerCase().includes('@ai') || data.content.toLowerCase().includes('ai bot')) {
        // Handle AI message
        const axios = require('axios');
        const token = data.token; // Assume token is sent with message

        try {
          const aiResponse = await axios.post('http://localhost:5000/api/ai/chat', {
            message: data.content.replace(/@ai|@ai bot/gi, '').trim(),
            roomId: data.roomId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Save AI message to database
          const aiMessage = new Message({
            roomId: data.roomId,
            sender: null, // AI doesn't have a user ID
            content: aiResponse.data.message,
          });
          await aiMessage.save();

          // Emit AI message to room
          io.to(data.roomId).emit('receive-message', {
            _id: aiMessage._id,
            roomId: aiMessage.roomId,
            sender: { username: 'AI Assistant' },
            content: aiMessage.content,
            timestamp: aiMessage.timestamp,
          });
        } catch (aiError) {
          console.error('AI response error:', aiError);
        }
      } else {
        // Save regular message to database
        const message = new Message({
          roomId: data.roomId,
          sender: data.senderId,
          content: data.content,
        });
        await message.save();

        // Populate sender info
        await message.populate('sender', 'username');

        // Emit to room
        io.to(data.roomId).emit('receive-message', {
          _id: message._id,
          roomId: message.roomId,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp,
        });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      user: data.user,
      isTyping: data.isTyping,
    });
  });

  socket.on('mark-read', async (data) => {
    try {
      const { messageId, userId, roomId } = data;
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: userId }
      });
      // Emit read receipt to room
      socket.to(roomId).emit('message-read', { messageId, userId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const cryptoRoutes = require('./routes/crypto');
const roomRoutes = require('./routes/rooms');
const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/rooms', roomRoutes);

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

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Implement proper E2EE room key management
    const room = await Room.findById(roomId).populate('members.userId', 'publicKey');
    if (room) {
      const roomKey = crypto.randomBytes(32).toString('base64');
      const encryptedKeys = {};
      for (const member of room.members) {
        const user = member.userId;
        if (user.publicKey) {
          const encryptedKey = crypto.publicEncrypt(
            {
              key: user.publicKey,
              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash: 'sha256',
            },
            Buffer.from(roomKey, 'base64')
          );
          encryptedKeys[user._id] = encryptedKey.toString('base64');
        }
      }
      io.to(roomId).emit('room-key-distribution', {
        roomId,
        encryptedKeys,
      });
    }
  });

  socket.on('request-room-key', async (data) => {
    const { roomId } = data;
    const room = await Room.findById(roomId).populate('members.userId', 'publicKey');
    if (room) {
      const roomKey = crypto.randomBytes(32).toString('base64');
      const encryptedKeys = {};
      for (const member of room.members) {
        const user = member.userId;
        if (user.publicKey) {
          const encryptedKey = crypto.publicEncrypt(
            {
              key: user.publicKey,
              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash: 'sha256',
            },
            Buffer.from(roomKey, 'base64')
          );
          encryptedKeys[user._id] = encryptedKey.toString('base64');
        }
      }
      io.to(roomId).emit('room-key-distribution', {
        roomId,
        encryptedKeys,
      });
    }
  });

  socket.on('send-message', async (data) => {
    try {
      const token = data.token || socket.handshake.auth.token;
      if (!token) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id || decoded.userId);

      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      let messageData = {
        roomId: data.roomId,
        sender: user._id,
        content: data.content,
        isEncrypted: data.isEncrypted || false,
        ciphertext: data.ciphertext,
        nonce: data.nonce
      };

      // Save message to database
      const message = new Message(messageData);
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
        isEncrypted: message.isEncrypted,
        ciphertext: message.ciphertext,
        nonce: message.nonce
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
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
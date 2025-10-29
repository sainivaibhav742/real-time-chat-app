# Real-Time Chat App

A full-stack real-time chat application built with Next.js, Node.js, Socket.io, and MongoDB. Features include user authentication, chat rooms, typing indicators, read receipts, message history, emoji picker, and AI chatbot integration.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSockets
- **User Authentication**: JWT-based login and registration
- **Chat Rooms**: Join different chat rooms
- **Typing Indicators**: See when others are typing
- **Read Receipts**: Know when messages are read
- **Message History**: Persistent chat history stored in MongoDB
- **Emoji Picker**: Add emojis to messages
- **AI Chatbot**: Integrated OpenAI GPT for conversational AI (@ai mentions)
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **OpenAI API** - AI chatbot integration

### Deployment
- **Docker** - Containerization
- **Vercel** - Frontend deployment
- **Render/Railway** - Backend deployment
- **MongoDB Atlas** - Cloud database

## 📁 Project Structure

```
chat-app/
├── client/                   # Next.js Frontend
│   ├── app/
│   │   ├── auth/page.tsx     # Login/Signup page
│   │   ├── chat/[room]/
│   │   │   └── page.tsx      # Chat room page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ChatWindow.tsx    # Main chat interface
│   │   ├── MessageBubble.tsx # Individual message component
│   │   ├── EmojiPicker.tsx   # Emoji selection component
│   │   └── TypingIndicator.tsx # Typing status display
│   ├── utils/
│   │   └── socket.ts         # Socket.io client setup
│   ├── package.json
│   └── next.config.js
│
├── server/                   # Node.js Backend
│   ├── index.js              # Main server file
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Message.js        # Message schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── messages.js       # Message API routes
│   │   └── ai.js             # AI chatbot routes
│   ├── Dockerfile            # Docker configuration
│   ├── package.json
│   └── .env                  # Environment variables
│
├── .gitignore
├── README.md
└── TODO.md                   # Development progress tracker
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/real-time-chat-app.git
   cd real-time-chat-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_super_secret_jwt_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

5. **Start MongoDB**

   If using local MongoDB:
   ```bash
   mongod
   ```

6. **Run the Application**

   Terminal 1 - Backend:
   ```bash
   cd server
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd client
   npm run dev
   ```

7. **Access the Application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Messages
- `GET /api/messages/:roomId` - Get message history for a room
- `POST /api/messages` - Send a message

### AI Chatbot
- `POST /api/ai/chat` - Get AI response

## 🌐 Socket.io Events

### Client to Server
- `join-room` - Join a chat room
- `send-message` - Send a message
- `typing` - Indicate typing status
- `stop-typing` - Stop typing indicator
- `mark-read` - Mark messages as read

### Server to Client
- `message` - Receive new message
- `user-joined` - User joined the room
- `user-left` - User left the room
- `typing` - User started typing
- `stop-typing` - User stopped typing
- `read-receipt` - Message read confirmation

## 🤖 AI Chatbot Usage

To interact with the AI chatbot:
1. Type `@ai` followed by your message
2. The AI will respond automatically
3. Example: `@ai What is the weather like today?`

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy Backend**
   - Create account on Render.com or Railway.app
   - Connect your GitHub repository
   - Set environment variables in deployment settings
   - Deploy

3. **Update Frontend Environment**
   - Update API URLs in frontend to point to deployed backend

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd client
   npm install -g vercel
   vercel
   ```

2. **Configure Environment Variables**
   - Set `NEXT_PUBLIC_API_URL` to your deployed backend URL

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend environment variables

## 🐳 Docker Deployment

### Backend
```bash
cd server
docker build -t chat-backend .
docker run -p 5000:5000 --env-file .env chat-backend
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📱 Usage

1. **Register/Login**: Create an account or login
2. **Join Room**: Navigate to a chat room (e.g., /chat/general)
3. **Send Messages**: Type and send messages
4. **Use Emojis**: Click the emoji button to add emojis
5. **AI Chat**: Mention @ai to chat with the AI
6. **Real-time Features**: See typing indicators and read receipts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Socket.io for real-time communication
- OpenAI for AI integration
- MongoDB for the database

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Happy Chatting! 🎉**

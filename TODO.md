# Real-Time Chat App Build Plan

## Phase 1: Setup Environment
- [ ] Check and install Node.js
- [ ] Check and install MongoDB
- [ ] Ensure VS Code is set up (already open)
- [ ] Create client/ and server/ subdirectories
- [ ] Initialize Next.js app in client/
- [ ] Initialize Node.js project in server/
- [ ] Initialize Git repository
- [ ] Push initial commit to GitHub

## Phase 2: Build Backend
- [ ] Install backend dependencies (express, socket.io, mongoose, cors, dotenv, jsonwebtoken, bcrypt)
- [ ] Setup Express server with Socket.io
- [ ] Connect to MongoDB
- [ ] Create User and Message models
- [ ] Add auth routes (/register, /login)
- [ ] Implement Socket.io events for messages, typing, etc.
- [ ] Add Dockerfile for backend containerization

## Phase 3: Build Frontend
- [ ] Install Tailwind CSS in client/
- [ ] Create login/signup pages
- [ ] Connect Socket.io client
- [ ] Build chat UI components (ChatWindow, MessageBubble, etc.)
- [ ] Handle real-time message rendering

## Phase 4: Add Features
- [ ] Add typing indicator
- [ ] Add read receipts
- [ ] Add message history
- [ ] Add emoji picker
- [ ] Integrate AI chatbot with OpenAI API

## Phase 5: Deploy
- [ ] Setup MongoDB Atlas
- [ ] Deploy backend to Render/Railway using Docker
- [ ] Deploy frontend to Vercel
- [ ] Use GitHub Actions for CI/CD if needed

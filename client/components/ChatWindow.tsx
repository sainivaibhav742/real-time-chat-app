'use client';

import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import MessageBubble from './MessageBubble';

interface Message {
  _id: string;
  sender: {
    username: string;
  };
  content: string;
  timestamp: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const socket = getSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Join room
    socket.emit('join-room', roomId);

    // Load message history
    fetchMessages();

    // Listen for new messages
    socket.on('receive-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data: { user: string; isTyping: boolean }) => {
      setTypingUser(data.user);
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
    };
  }, [roomId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    socket.emit('send-message', {
      roomId,
      senderId: user.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
    socket.emit('typing', { roomId, user: user.username, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (user) {
      socket.emit('typing', {
        roomId,
        user: user.username,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 border-b">
        <h1 className="text-lg font-semibold text-gray-900">Room: {roomId}</h1>
        {user && (
          <p className="text-sm text-gray-600">Logged in as {user.username}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={user ? message.sender.username === user.username : false}
          />
        ))}
        {isTyping && typingUser !== user?.username && (
          <div className="text-sm text-gray-500 italic mb-2">
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-4 py-3">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

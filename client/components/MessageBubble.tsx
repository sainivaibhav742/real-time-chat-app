'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';

interface Message {
  _id: string;
  sender: {
    username: string;
  };
  content: string;
  timestamp: string;
  roomId?: string;
  readBy?: string[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const socket = getSocket();
  const [readBy, setReadBy] = useState<string[]>(message.readBy || []);

  useEffect(() => {
    if (!isOwn) {
      // Mark message as read
      socket.emit('mark-read', {
        messageId: message._id,
        userId: JSON.parse(localStorage.getItem('user') || '{}').id,
        roomId: message.roomId,
      });
    }

    // Listen for read receipts
    socket.on('message-read', (data: { messageId: string; userId: string }) => {
      if (data.messageId === message._id) {
        setReadBy(prev => [...prev, data.userId]);
      }
    });

    return () => {
      socket.off('message-read');
    };
  }, [message._id, isOwn, socket]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAI = message.sender.username.toLowerCase() === 'ai bot';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
            : isAI
            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 text-slate-900 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800 rounded-bl-md'
            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-600'
        }`}
      >
        {!isOwn && (
          <div className={`flex items-center space-x-2 mb-2 ${isAI ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            {isAI ? (
              <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {message.sender.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-semibold">
              {isAI ? 'AI Assistant' : message.sender.username}
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed">{message.content}</div>
        <div className="flex items-center justify-between mt-2">
          <div
            className={`text-xs ${
              isOwn
                ? 'text-blue-200'
                : isAI
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
          {isOwn && readBy.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-blue-200">✓</span>
              <span className="text-xs text-blue-200">{readBy.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

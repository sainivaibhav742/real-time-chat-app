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

    const onMessageRead = (data: { messageId: string; userId: string }) => {
      if (data.messageId === message._id) {
        setReadBy(prev => [...prev, data.userId]);
      }
    };

    // Listen for read receipts
    socket.on('message-read', onMessageRead);

    return () => {
      socket.off('message-read', onMessageRead);
    };
  }, [message._id, isOwn, socket, message.roomId]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAI = message.sender.username.toLowerCase() === 'ai bot';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className="flex flex-col max-w-xs lg:max-w-md">
        {/* User and Time Header */}
        <div className={`flex items-center space-x-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {!isOwn && (
            <>
              {isAI ? (
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">
                    {message.sender.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className={`text-xs font-semibold ${isAI ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {isAI ? 'AI Assistant' : message.sender.username}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(message.timestamp)}
              </span>
            </>
          )}
          {isOwn && (
            <>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                You
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(message.timestamp)}
              </span>
            </>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
              isOwn
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-br-lg shadow-gray-500/25'
                : isAI
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-gray-900 dark:text-gray-100 border border-emerald-200/50 dark:border-emerald-800/50 rounded-bl-lg'
                : 'bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-gray-100 rounded-bl-lg border border-gray-200/50 dark:border-gray-600/50 shadow-gray-200/50 dark:shadow-gray-800/50'
          }`}
        >
          <div className="text-sm leading-relaxed">{message.content}</div>
          {isOwn && readBy.length > 0 && (
            <div className="flex items-center justify-end mt-2 space-x-1">
              <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-blue-200 font-medium">{readBy.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
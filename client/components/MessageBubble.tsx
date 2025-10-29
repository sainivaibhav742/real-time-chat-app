import React from 'react';

interface Message {
  _id: string;
  sender: {
    username: string;
  };
  content: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwn && (
          <div className="text-xs font-semibold text-gray-600 mb-1">
            {message.sender.username}
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

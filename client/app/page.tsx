'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchRoomsAndRedirect = async () => {
      if (token) {
        try {
          const response = await fetch('/api/rooms', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const rooms = await response.json();
            if (rooms.length > 0) {
              router.push(`/chat/${rooms[0]._id}`);
            } else {
              router.push('/chat');
            }
          } else {
            // If fetching rooms fails, redirect to auth
            router.push('/auth');
          }
        } catch (error) {
          console.error('Failed to fetch rooms', error);
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
      setIsLoading(false);
    };

    const timer = setTimeout(fetchRoomsAndRedirect, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gray-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-700 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center space-y-8 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            ChatFlow
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Real-time messaging with AI integration
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700">
              ⚡ Real-time chat
            </span>
            <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600">
              🤖 AI assistant
            </span>
            <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800">
              🔒 Secure messaging
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center space-x-3">
            <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce shadow-lg"></div>
            <div className="w-4 h-4 bg-gray-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-gray-700 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        <div className="text-base text-gray-500 dark:text-gray-400 font-medium">
          Connecting you to the conversation...
        </div>
      </div>
    </div>
  );
}

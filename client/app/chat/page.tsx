'use client';

import { useRouter } from 'next/navigation';

export default function NoRoomSelected() {
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">No Room Selected</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm">
          You are not part of any room yet. Join an existing room or create a new one to start chatting.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => router.push('/chat/createroom')} 
            className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            Create a Room
          </button>
          <button 
            onClick={() => router.push('/chat/joinroom')} 
            className="px-6 py-3 font-semibold text-slate-700 bg-white rounded-lg shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300 transform hover:scale-105 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
          >
            Join a Room
          </button>
        </div>
      </div>
    </div>
  );
}

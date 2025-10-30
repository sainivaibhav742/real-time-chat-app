'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        router.push(`/chat/${newRoom._id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create room');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">Create a New Room</h2>
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label htmlFor="roomName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Room Name</label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Enter a name for your room"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
          >
            Create Room
          </button>
        </form>
        <div className="text-center">
          <button onClick={() => router.back()} className="text-sm text-slate-600 dark:text-slate-400 hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Room {
  _id: string;
  name: string;
  members: any[];
}

export default function JoinRoomPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/rooms/search?q=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (data.length === 0) {
          setError('No rooms found with that name.');
        } else {
          setError('');
        }
      } else {
        setError('Failed to search for rooms');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push(`/chat/${roomId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to join room');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">Join a Room</h2>
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for a room..."
          />
          <button type="submit" className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700">Search</button>
        </form>
        
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="space-y-3 h-60 overflow-y-auto pr-2">
          {results.map((room) => (
            <div key={room._id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{room.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{room.members.length} member(s)</p>
              </div>
              <button onClick={() => handleJoinRoom(room._id)} className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">Join</button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => router.back()} className="text-sm text-slate-600 dark:text-slate-400 hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

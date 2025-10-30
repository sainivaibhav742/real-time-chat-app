'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoomListItem from './RoomListItem';

interface Room {
  _id: string;
  name: string;
  members: Array<{
    userId: {
      _id: string;
      username: string;
      email: string;
    };
    joinedAt: string;
  }>;
  createdAt: string;
}

interface RoomSidebarProps {
  currentRoomId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function RoomSidebar({ currentRoomId, isCollapsed, onToggleCollapse }: RoomSidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRooms = async (query: string) => {
    if (!query.trim()) {
      fetchRooms();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rooms/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName.trim() }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        setRooms(prev => [...prev, newRoom]);
        setNewRoomName('');
        setIsCreatingRoom(false);
        router.push(`/chat/${newRoom._id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchRooms(query);
  };

  const handleRoomSelect = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className={`bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 border-r border-gray-700/50 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white">Chat Rooms</h2>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 flex justify-center items-center rounded-lg hover:bg-gray-700/50 transition-colors"
              title="Expand sidebar"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 pl-11 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent backdrop-blur-sm"
              />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Create Room Button */}
            <button
              onClick={() => setIsCreatingRoom(!isCreatingRoom)}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Room
            </button>

            {/* Create Room Form */}
            {isCreatingRoom && (
              <div className="mt-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder="Enter room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent mb-3"
                  onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={createRoom}
                    disabled={!newRoomName.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingRoom(false);
                      setNewRoomName('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {!isCollapsed && (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm">{searchQuery ? 'No rooms found' : 'No rooms yet'}</p>
                {!searchQuery && (
                  <p className="text-xs text-gray-500">Create your first room to get started!</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2">
            {rooms.map((room) => (
              <RoomListItem
                key={room._id}
                room={room}
                isActive={room._id === currentRoomId}
                onRoomSelect={handleRoomSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
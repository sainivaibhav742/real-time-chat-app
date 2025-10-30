'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ChatWindow from '../../../components/ChatWindow';
import RoomSidebar from '../../../components/RoomSidebar';
import { getSocket } from '../../../utils/socket';
import { initializeUserCrypto } from '../../../utils/crypto';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.room as string;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // E2EE functionality commented out for now
    // socket.on('room-key-distribution', handleRoomKeyDistribution);

    return () => {
      // socket.off('room-key-distribution', handleRoomKeyDistribution);
    };
  }, [roomId]);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768); // Collapse on mobile
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <RoomSidebar
        currentRoomId={roomId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <ChatWindow roomId={roomId} />
      </div>
    </div>
  );
}

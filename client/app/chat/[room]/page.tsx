'use client';

import { useParams } from 'next/navigation';
import ChatWindow from '../../../components/ChatWindow';
import { useEffect } from 'react';
import { getSocket, handleRoomKeyDistribution } from '../../../utils/socket';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.room as string;

  useEffect(() => {
    const socket = getSocket();

    // Listen for room key distribution
    socket.on('room-key-distribution', handleRoomKeyDistribution);

    return () => {
      socket.off('room-key-distribution', handleRoomKeyDistribution);
    };
  }, [roomId]);

  return <ChatWindow roomId={roomId} />;
}

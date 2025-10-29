'use client';

import { useParams } from 'next/navigation';
import ChatWindow from '../../../components/ChatWindow';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.room as string;

  return <ChatWindow roomId={roomId} />;
}

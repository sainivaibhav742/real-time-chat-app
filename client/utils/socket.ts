import { io, Socket } from 'socket.io-client';
import { encryptMessage, decryptMessage, getRoomKey, storeRoomKey, encryptRoomKeyForUser, decryptRoomKeyForUser, getUserKeypair } from './crypto';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Encrypted message sending
export const sendEncryptedMessage = async (roomId: string, message: string, username: string) => {
  const socket = getSocket();
  let roomKey = getRoomKey(roomId);

  if (!roomKey) {
    // Request room key from server if not available
    socket.emit('request-room-key', { roomId });
    // Wait for room key response (this would need to be handled asynchronously)
    return;
  }

  const encrypted = await encryptMessage(message, roomKey);
  socket.emit('send-message', {
    roomId,
    username,
    ciphertext: encrypted.ciphertext,
    nonce: encrypted.nonce,
    isEncrypted: true
  });
};

// Handle incoming encrypted messages
export const handleEncryptedMessage = async (messageData: any) => {
  const { roomId, username, ciphertext, nonce, isEncrypted } = messageData;

  if (!isEncrypted) {
    return messageData; // Return as-is for non-encrypted messages
  }

  const roomKey = getRoomKey(roomId);
  if (!roomKey) {
    console.error('No room key available for decryption');
    return { ...messageData, content: '[Encrypted message - key not available]' };
  }

  const decryptedContent = await decryptMessage(ciphertext, nonce, roomKey);
  if (!decryptedContent) {
    console.error('Failed to decrypt message');
    return { ...messageData, content: '[Failed to decrypt]' };
  }

  return {
    ...messageData,
    content: decryptedContent
  };
};

// Handle room key distribution
export const handleRoomKeyDistribution = async (data: { roomId: string; encryptedKeys: { [userId: string]: string } }) => {
  const { roomId, encryptedKeys } = data;
  const userKeypair = getUserKeypair();

  if (!userKeypair) {
    console.error('No user keypair available');
    return;
  }

  const userId = localStorage.getItem('userId'); // Assuming userId is stored
  if (!userId || !encryptedKeys[userId]) {
    console.error('No encrypted key for this user');
    return;
  }

  const decryptedKey = await decryptRoomKeyForUser(
    encryptedKeys[userId],
    userKeypair.privateKey,
    userKeypair.publicKey
  );

  if (decryptedKey) {
    storeRoomKey(roomId, decryptedKey);
  } else {
    console.error('Failed to decrypt room key');
  }
};

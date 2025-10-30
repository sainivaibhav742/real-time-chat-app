import { io, Socket } from 'socket.io-client';
import { encryptMessage, decryptMessage, getRoomKey, storeRoomKey, encryptRoomKeyForUser, decryptRoomKeyForUser, getUserKeypair, initializeUserCrypto } from './crypto';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    socket = io('http://localhost:5000', { // Explicitly set server URL
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
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

// Encrypted message sending - commented out E2EE for now
export const sendEncryptedMessage = async (roomId: string, message: string, username: string) => {
  const socket = getSocket();
  // For now, send unencrypted message
  socket.emit('send-message', {
    roomId,
    content: message,
    isEncrypted: false
  });
  /*
  let roomKey = getRoomKey(roomId);

  if (!roomKey) {
    // Request a room key from the server
    socket.emit('request-room-key', { roomId });
    // For now, send unencrypted message if no room key
    socket.emit('send-message', {
      roomId,
      content: message,
      isEncrypted: false
    });
    return;
  }

  const encrypted = await encryptMessage(message, roomKey);
  socket.emit('send-message', {
    roomId,
    ciphertext: encrypted.ciphertext,
    nonce: encrypted.nonce,
    isEncrypted: true
  });
  */
};

// Handle incoming encrypted messages - commented out E2EE for now
export const handleEncryptedMessage = async (messageData: any) => {
  // For now, return messages as-is (they should be unencrypted)
  return messageData;
  /*
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
  */
};

// Handle room key distribution
// Commented out E2EE functionality for now to suppress errors
/*
export const handleRoomKeyDistribution = async (data: { roomId: string; encryptedKeys: { [userId: string]: string } }) => {
  const { roomId, encryptedKeys } = data;
  const userKeypair = getUserKeypair();

  if (!userKeypair) {
    console.error('No user keypair available - initializing crypto...');
    // Try to initialize crypto if not available
    try {
      await initializeUserCrypto();
      const newKeypair = getUserKeypair();
      if (!newKeypair) {
        console.error('Failed to initialize user keypair');
        return;
      }
      // Retry with new keypair
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;
      if (userId && encryptedKeys[userId]) {
        const decryptedKey = await decryptRoomKeyForUser(
          encryptedKeys[userId],
          newKeypair.privateKey,
          newKeypair.publicKey
        );
        if (decryptedKey) {
          storeRoomKey(roomId, decryptedKey);
        }
      }
    } catch (error) {
      console.error('Failed to initialize crypto:', error);
    }
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;

  if (!userId) {
    console.error('No user ID found');
    return;
  }

  // Debug logging
  console.log('User ID:', userId);
  console.log('Available encrypted keys:', Object.keys(encryptedKeys));
  console.log('User object:', user);

  if (!encryptedKeys[userId]) {
    console.error('No encrypted key for this user - user may not be in room members');
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
*/
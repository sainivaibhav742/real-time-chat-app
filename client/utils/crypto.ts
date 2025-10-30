import sodium from 'libsodium-wrappers';

// Initialize sodium
let sodiumReady = false;

export const initSodium = async () => {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
};

// Generate X25519 keypair for user
export const generateUserKeypair = async () => {
  await initSodium();
  const keypair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keypair.publicKey),
    privateKey: sodium.to_base64(keypair.privateKey)
  };
};

let userPrivateKey: string | null = null;

// Store user keypair securely (in production, use proper key management)
export const storeUserKeypair = async (keypair: { publicKey: string; privateKey: string }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userPublicKey', keypair.publicKey);
    localStorage.setItem('userPrivateKey', keypair.privateKey);
    // Store the private key as a simple reference for later retrieval
    userPrivateKey = keypair.privateKey;
  }
};

// Retrieve user keypair
export const getUserKeypair = () => {
  if (typeof window !== 'undefined') {
    const publicKey = localStorage.getItem('userPublicKey');
    const privateKey = localStorage.getItem('userPrivateKey');
    if (publicKey && privateKey) {
      return { publicKey, privateKey };
    }
  }
  return null;
};

// Generate room symmetric key
export const generateRoomKey = async () => {
  await initSodium();
  const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  return sodium.to_base64(key);
};

// Encrypt message with room key
export const encryptMessage = async (message: string, roomKey: string) => {
  await initSodium();
  const key = sodium.from_base64(roomKey);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const messageBytes = sodium.from_string(message);
  const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, key);

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce)
  };
};

// Decrypt message with room key
export const decryptMessage = async (ciphertext: string, nonce: string, roomKey: string) => {
  await initSodium();
  try {
    const key = sodium.from_base64(roomKey);
    const ciphertextBytes = sodium.from_base64(ciphertext);
    const nonceBytes = sodium.from_base64(nonce);
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertextBytes, nonceBytes, key);
    return sodium.to_string(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Encrypt room key with sealed box for each room member
export const encryptRoomKeyForUser = async (roomKey: string, recipientPublicKey: string) => {
  await initSodium();
  const recipientPubKey = sodium.from_base64(recipientPublicKey);
  const roomKeyBytes = sodium.from_base64(roomKey);
  const encryptedKey = sodium.crypto_box_seal(roomKeyBytes, recipientPubKey);
  return sodium.to_base64(encryptedKey);
};

// Decrypt room key with sealed box
export const decryptRoomKeyForUser = async (encryptedRoomKey: string, userPrivateKey: string, userPublicKey: string) => {
  await initSodium();
  try {
    const encryptedKeyBytes = sodium.from_base64(encryptedRoomKey);
    const publicKey = sodium.from_base64(userPublicKey);
    const privateKey = sodium.from_base64(userPrivateKey);
    const opened = sodium.crypto_box_seal_open(encryptedKeyBytes, publicKey, privateKey);
    return sodium.to_base64(opened);
  } catch (error) {
    console.error('Room key decryption failed:', error);
    return null;
  }
};

// Store room keys securely
export const storeRoomKey = (roomId: string, roomKey: string) => {
  if (typeof window !== 'undefined') {
    const roomKeys = JSON.parse(localStorage.getItem('roomKeys') || '{}');
    roomKeys[roomId] = roomKey;
    localStorage.setItem('roomKeys', JSON.stringify(roomKeys));
  }
};

// Get room key
export const getRoomKey = (roomId: string) => {
  if (typeof window !== 'undefined') {
    const roomKeys = JSON.parse(localStorage.getItem('roomKeys') || '{}');
    return roomKeys[roomId] || null;
  }
  return null;
};

// Initialize user crypto on app start
export const initializeUserCrypto = async () => {
  let keypair = getUserKeypair();
  if (!keypair) {
    const newKeypair = await generateUserKeypair();
    await storeUserKeypair(newKeypair);
    keypair = getUserKeypair();
  }
  return keypair;
};
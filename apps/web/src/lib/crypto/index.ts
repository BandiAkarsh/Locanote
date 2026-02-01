// ============================================================================
// CRYPTO MODULE INDEX
// ============================================================================
// Central export point for all encryption utilities.
//
// USAGE:
// import { generateRoomKey, encryptMessage } from '$crypto';
//
// INSTEAD OF:
// import { generateRoomKey } from '$crypto/e2e';
// ============================================================================

export {
  // Key Management
  generateRoomKey,
  deriveKeyFromPassword,
  storeRoomKey,
  getRoomKey,
  hasRoomKey,
  removeRoomKey,
  clearAllKeys,
  
  // Encryption/Decryption
  encryptMessage,
  decryptMessage,
  encryptBytes,
  decryptBytes,
  
  // Types
  type RoomKey,
  type EncryptedMessage
} from './e2e';

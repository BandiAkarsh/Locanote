// ============================================================================
// CRYPTO MODULE INDEX
// ============================================================================
// Central export point for all encryption utilities.
//
// ARCHITECTURE:
// - types.ts: Abstract interfaces (CryptoAdapter, RoomKey, EncryptedMessage)
// - tweetnacl-adapter.ts: TweetNaCl implementation of CryptoAdapter
// - e2e.ts: Legacy function-based API (for backward compatibility)
//
// TO SWAP CRYPTO LIBRARY:
// 1. Create new adapter implementing CryptoAdapter interface
// 2. Export it here instead of tweetNaClAdapter
// 3. All consuming code continues to work unchanged
//
// USAGE:
// import { crypto, type CryptoAdapter } from '$crypto';
// crypto.encryptMessage(message, key);
//
// OR (legacy):
// import { encryptMessage } from '$crypto';
// encryptMessage(message, key);
// ============================================================================

// ============================================================================
// TYPES (Abstract - Implementation Agnostic)
// ============================================================================

export type {
  RoomKey,
  EncryptedMessage,
  DerivedKey,
  CryptoAdapter,
} from "./types";

export { EncryptionError, DecryptionError, KeyNotFoundError } from "./types";

// ============================================================================
// ADAPTER (Current Implementation: TweetNaCl)
// ============================================================================

export { createTweetNaClAdapter, tweetNaClAdapter } from "./tweetnacl-adapter";

// Default crypto instance - use this in most code
export { tweetNaClAdapter as crypto } from "./tweetnacl-adapter";

// ============================================================================
// LEGACY API (Function-based - For Backward Compatibility)
// ============================================================================
// These exports maintain compatibility with existing code.
// New code should prefer the crypto adapter interface.

export {
  // Key Management
  generateRoomKey,
  deriveKeyFromPassword,
  storeRoomKey,
  getRoomKey,
  hasRoomKey,
  removeRoomKey,
  clearAllKeys,
  protectRoomWithPassword,

  // Encryption/Decryption
  encryptMessage,
  decryptMessage,
  encryptBytes,
  decryptBytes,
} from "./e2e";

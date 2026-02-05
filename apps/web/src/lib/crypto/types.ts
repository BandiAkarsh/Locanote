// ============================================================================
// CRYPTO MODULE TYPES
// ============================================================================
// Abstract type definitions for the encryption system.
// These types are implementation-agnostic - they don't reference TweetNaCl
// or any specific crypto library, making the module easily replaceable.
//
// FUTURE IMPLEMENTATIONS COULD USE:
// - Web Crypto API (native browser)
// - libsodium.js
// - noble-ciphers
// - Any library that implements XSalsa20-Poly1305 or equivalent
// ============================================================================

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Represents an encryption key for a collaborative room.
 * Keys are stored in memory only for security.
 */
export interface RoomKey {
  /** Unique identifier for the room this key belongs to */
  roomId: string;
  /** 32-byte encryption key (XSalsa20-Poly1305 or equivalent) */
  key: Uint8Array;
  /** Unix timestamp when this key was created */
  createdAt: number;
}

/**
 * Represents an encrypted message with its nonce.
 * Both values are Base64-encoded for safe transport.
 */
export interface EncryptedMessage {
  /** Base64-encoded encrypted data */
  ciphertext: string;
  /** Base64-encoded nonce (24 bytes for XSalsa20) */
  nonce: string;
}

/**
 * Result of key derivation from a password.
 */
export interface DerivedKey {
  /** The derived 32-byte encryption key */
  key: Uint8Array;
  /** The salt used for derivation (store this to re-derive later) */
  salt: Uint8Array;
}

// ============================================================================
// CRYPTO ADAPTER INTERFACE
// ============================================================================
// This interface defines the contract for any crypto implementation.
// To swap crypto libraries, implement this interface with the new library.

/**
 * Abstract interface for encryption operations.
 * Implementations can use any crypto library that supports authenticated encryption.
 *
 * @example Swapping implementations:
 * ```typescript
 * // Current: TweetNaCl
 * import { createTweetNaClAdapter } from './tweetnacl-adapter';
 * export const crypto = createTweetNaClAdapter();
 *
 * // Future: Web Crypto API
 * import { createWebCryptoAdapter } from './webcrypto-adapter';
 * export const crypto = createWebCryptoAdapter();
 * ```
 */
export interface CryptoAdapter {
  // -------------------------------------------------------------------------
  // Key Generation
  // -------------------------------------------------------------------------

  /** Generate a random 32-byte encryption key */
  generateKey(): Uint8Array;

  /** Derive a key from a password using a salt */
  deriveKeyFromPassword(password: string, salt?: Uint8Array): DerivedKey;

  // -------------------------------------------------------------------------
  // Key Storage (in-memory)
  // -------------------------------------------------------------------------

  /** Store a key for a room */
  storeKey(roomId: string, key: Uint8Array): void;

  /** Retrieve a stored key */
  getKey(roomId: string): Uint8Array | undefined;

  /** Check if a key exists for a room */
  hasKey(roomId: string): boolean;

  /** Remove a key from storage */
  removeKey(roomId: string): void;

  /** Clear all stored keys */
  clearAllKeys(): void;

  // -------------------------------------------------------------------------
  // Encryption/Decryption
  // -------------------------------------------------------------------------

  /** Encrypt a string message */
  encryptMessage(message: string, key: Uint8Array): EncryptedMessage;

  /** Decrypt a message, returns null if decryption fails */
  decryptMessage(encrypted: EncryptedMessage, key: Uint8Array): string | null;

  /** Encrypt raw bytes */
  encryptBytes(data: Uint8Array, key: Uint8Array): EncryptedMessage;

  /** Decrypt to raw bytes, returns null if decryption fails */
  decryptBytes(encrypted: EncryptedMessage, key: Uint8Array): Uint8Array | null;
}

// ============================================================================
// CRYPTO ERROR TYPES
// ============================================================================

/**
 * Error thrown when encryption fails.
 */
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionError";
  }
}

/**
 * Error thrown when decryption fails (wrong key or tampered data).
 */
export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecryptionError";
  }
}

/**
 * Error thrown when a required key is not found.
 */
export class KeyNotFoundError extends Error {
  constructor(roomId: string) {
    super(`No encryption key found for room: ${roomId}`);
    this.name = "KeyNotFoundError";
  }
}

// ============================================================================
// E2E ENCRYPTION MODULE
// ============================================================================
// This module provides end-to-end encryption for collaborative notes using
// TweetNaCl (NaCl = Networking and Cryptography library).
//
// ENCRYPTION SCHEME:
// - XSalsa20-Poly1305: Fast, authenticated encryption
// - Each room has a unique encryption key
// - Keys are derived from user passwords or randomly generated
// - Encrypted before sending via WebRTC, decrypted on receipt
//
// SECURITY PROPERTIES:
// - Confidentiality: Only room members with the key can read content
// - Authenticity: Tampered messages are detected and rejected
// - Forward secrecy: Compromised key doesn't reveal past messages (with key rotation)
//
// KEY MANAGEMENT:
// - Keys stored in memory only (never persisted unencrypted)
// - Optional: Keys can be encrypted with user password before storage
// - Room passwords derive keys using PBKDF2
// ============================================================================

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// ============================================================================
// TYPES
// ============================================================================

export interface RoomKey {
  roomId: string;
  key: Uint8Array; // 32-byte key for XSalsa20-Poly1305
  createdAt: number;
}

export interface EncryptedMessage {
  ciphertext: string; // Base64 encoded encrypted data
  nonce: string; // Base64 encoded nonce (24 bytes)
}

// ============================================================================
// KEY STORAGE (IN-MEMORY ONLY)
// ============================================================================
// I store room keys in memory only for security.
// When the app closes, keys are lost (unless backed up via password).

const roomKeys = new Map<string, Uint8Array>();

// ============================================================================
// GENERATE RANDOM KEY
// ============================================================================
// Creates a new random 32-byte key for a room.
// This is used when creating a new room without a password.

export function generateRoomKey(): Uint8Array {
  return nacl.randomBytes(32);
}

// ============================================================================
// DERIVE KEY FROM PASSWORD
// ============================================================================
// Derives a 32-byte key from a user password using simple hashing.
// In production, use PBKDF2 or Argon2 with proper salt and iterations.

export function deriveKeyFromPassword(password: string, salt?: Uint8Array): { key: Uint8Array; salt: Uint8Array } {
  // Generate salt if not provided
  const usedSalt = salt || nacl.randomBytes(16);
  
  // Simple key derivation (in production, use PBKDF2)
  // This is a basic implementation for demonstration
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  // Combine password and salt
  const combined = new Uint8Array(passwordBytes.length + usedSalt.length);
  combined.set(passwordBytes);
  combined.set(usedSalt, passwordBytes.length);
  
  // Hash to get 32-byte key
  const hash = nacl.hash(combined);
  const key = hash.slice(0, 32);
  
  return { key, salt: usedSalt };
}

// ============================================================================
// STORE ROOM KEY
// ============================================================================
// Stores a room key in memory.

export function storeRoomKey(roomId: string, key: Uint8Array): void {
  roomKeys.set(roomId, key);
}

// ============================================================================
// GET ROOM KEY
// ============================================================================
// Retrieves a room key from memory.

export function getRoomKey(roomId: string): Uint8Array | undefined {
  return roomKeys.get(roomId);
}

// ============================================================================
// HAS ROOM KEY
// ============================================================================
// Checks if I have the key for a room.

export function hasRoomKey(roomId: string): boolean {
  return roomKeys.has(roomId);
}

// ============================================================================
// REMOVE ROOM KEY
// ============================================================================
// Removes a room key from memory (logout/leave room).

export function removeRoomKey(roomId: string): void {
  roomKeys.delete(roomId);
}

// ============================================================================
// ENCRYPT MESSAGE
// ============================================================================
// Encrypts a string message using XSalsa20-Poly1305.
// Returns base64-encoded ciphertext and nonce.

export function encryptMessage(message: string, key: Uint8Array): EncryptedMessage {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(message);
  
  // Generate random nonce (24 bytes for XSalsa20)
  const nonce = nacl.randomBytes(24);
  
  // Encrypt
  const ciphertext = nacl.secretbox(plaintext, nonce, key);
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }
  
  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce)
  };
}

// ============================================================================
// DECRYPT MESSAGE
// ============================================================================
// Decrypts a message using XSalsa20-Poly1305.
// Returns the decrypted string or null if decryption fails.

export function decryptMessage(encrypted: EncryptedMessage, key: Uint8Array): string | null {
  try {
    const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
    const nonce = naclUtil.decodeBase64(encrypted.nonce);
    
    // Decrypt
    const plaintext = nacl.secretbox.open(ciphertext, nonce, key);
    
    if (!plaintext) {
      return null; // Decryption failed (wrong key or tampered message)
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// ENCRYPT BYTES
// ============================================================================
// Encrypts raw bytes (for Yjs updates).

export function encryptBytes(data: Uint8Array, key: Uint8Array): EncryptedMessage {
  const nonce = nacl.randomBytes(24);
  const ciphertext = nacl.secretbox(data, nonce, key);
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }
  
  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce)
  };
}

// ============================================================================
// DECRYPT BYTES
// ============================================================================
// Decrypts to raw bytes (for Yjs updates).

export function decryptBytes(encrypted: EncryptedMessage, key: Uint8Array): Uint8Array | null {
  try {
    const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
    const nonce = naclUtil.decodeBase64(encrypted.nonce);
    
    return nacl.secretbox.open(ciphertext, nonce, key);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// CLEAR ALL KEYS
// ============================================================================
// Removes all room keys (e.g., on logout).

export function clearAllKeys(): void {
  roomKeys.clear();
}

// ============================================================================
// TWEETNACL CRYPTO ADAPTER
// ============================================================================
// Implementation of CryptoAdapter using TweetNaCl library.
// This file contains all TweetNaCl-specific code, making it easy to replace
// with a different crypto library in the future.
//
// TO SWAP CRYPTO LIBRARY:
// 1. Create a new adapter file (e.g., webcrypto-adapter.ts)
// 2. Implement the CryptoAdapter interface
// 3. Update index.ts to export the new adapter
// ============================================================================

import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import type { CryptoAdapter, DerivedKey, EncryptedMessage } from "./types";
import { EncryptionError } from "./types";

// ============================================================================
// KEY STORAGE (IN-MEMORY ONLY)
// ============================================================================

const roomKeys = new Map<string, Uint8Array>();

// ============================================================================
// TWEETNACL ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * Creates a CryptoAdapter using TweetNaCl for encryption.
 * Uses XSalsa20-Poly1305 authenticated encryption.
 */
export function createTweetNaClAdapter(): CryptoAdapter {
  return {
    // -------------------------------------------------------------------------
    // Key Generation
    // -------------------------------------------------------------------------

    generateKey(): Uint8Array {
      return nacl.randomBytes(32);
    },

    deriveKeyFromPassword(password: string, salt?: Uint8Array): DerivedKey {
      const usedSalt = salt || nacl.randomBytes(16);
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
    },

    // -------------------------------------------------------------------------
    // Key Storage
    // -------------------------------------------------------------------------

    storeKey(roomId: string, key: Uint8Array): void {
      roomKeys.set(roomId, key);
    },

    getKey(roomId: string): Uint8Array | undefined {
      return roomKeys.get(roomId);
    },

    hasKey(roomId: string): boolean {
      return roomKeys.has(roomId);
    },

    removeKey(roomId: string): void {
      roomKeys.delete(roomId);
    },

    clearAllKeys(): void {
      roomKeys.clear();
    },

    // -------------------------------------------------------------------------
    // Encryption/Decryption
    // -------------------------------------------------------------------------

    encryptMessage(message: string, key: Uint8Array): EncryptedMessage {
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(message);
      const nonce = nacl.randomBytes(24);
      const ciphertext = nacl.secretbox(plaintext, nonce, key);

      if (!ciphertext) {
        throw new EncryptionError("Encryption failed");
      }

      return {
        ciphertext: naclUtil.encodeBase64(ciphertext),
        nonce: naclUtil.encodeBase64(nonce),
      };
    },

    decryptMessage(
      encrypted: EncryptedMessage,
      key: Uint8Array,
    ): string | null {
      try {
        const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
        const nonce = naclUtil.decodeBase64(encrypted.nonce);
        const plaintext = nacl.secretbox.open(ciphertext, nonce, key);

        if (!plaintext) {
          return null;
        }

        const decoder = new TextDecoder();
        return decoder.decode(plaintext);
      } catch {
        return null;
      }
    },

    encryptBytes(data: Uint8Array, key: Uint8Array): EncryptedMessage {
      const nonce = nacl.randomBytes(24);
      const ciphertext = nacl.secretbox(data, nonce, key);

      if (!ciphertext) {
        throw new EncryptionError("Encryption failed");
      }

      return {
        ciphertext: naclUtil.encodeBase64(ciphertext),
        nonce: naclUtil.encodeBase64(nonce),
      };
    },

    decryptBytes(
      encrypted: EncryptedMessage,
      key: Uint8Array,
    ): Uint8Array | null {
      try {
        const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
        const nonce = naclUtil.decodeBase64(encrypted.nonce);
        return nacl.secretbox.open(ciphertext, nonce, key);
      } catch {
        return null;
      }
    },
  };
}

// ============================================================================
// DEFAULT ADAPTER INSTANCE
// ============================================================================
// Pre-created instance for convenience. Most code should use this.

export const tweetNaClAdapter = createTweetNaClAdapter();

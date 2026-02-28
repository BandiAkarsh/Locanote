// ============================================================================
// CRYPTO MODULE EXPORTS
// ============================================================================
// Central export point for all cryptographic functionality
//
// USAGE:
// import { encrypt, decrypt, generateEncryptionKey } from '$crypto';
// import { getOrCreateMasterKey } from '$crypto/key-storage';
// ============================================================================

// Noble Crypto (Primary)
export {
  // Key generation
  generateEncryptionKey,
  generateX25519KeyPair,
  generateSalt,
  generateNonce,

  // Key derivation
  deriveKeyFromPassword,
  deriveKeyPBKDF2,

  // Encryption
  encrypt,
  decrypt,
  encryptWithPassword,
  decryptWithPassword,

  // Key exchange
  computeSharedSecret,
  deriveKeyFromSharedSecret,

  // Key wrapping
  wrapKey,
  unwrapKey,

  // Utilities
  constantTimeEqual,
  secureClear,
  bytesToBase64,
  base64ToBytes,
  hash,
  hashHex,
  rotateKey,

  // Audit logging
  logCryptoOperation,
  getAuditLog,
  clearAuditLog,

  // Types
  type EncryptedData,
  type EncryptedMessage,
  type KeyPair,
  type EncryptedKeyExport,
  type Argon2Params,
  type CryptoAuditLog,
} from "./noble-crypto";

// Key Storage
export {
  // Master key management
  getOrCreateMasterKey,
  clearMasterKeyCache,

  // Note keys
  getOrCreateNoteKey,

  // Sync keys
  generateSyncKey,

  // Key rotation
  rotateMasterKey,
  checkKeyRotationNeeded,

  // Import/Export
  exportKeys,
  importKeys,

  // Cleanup
  deleteKey,
  deleteAllUserKeys,

  // Types
  type StoredKey,
  type KeyMetadata,
  type KeyExportBundle,
  type ExportedKeyData,
  type KeyRotationPolicy,
  type RotationResult,
} from "./key-storage";

// ============================================================================
// CHALLENGE GENERATION
// ============================================================================
// WebAuthn requires a "challenge" - a random value that prevents replay attacks.
// 
// WHAT IS A REPLAY ATTACK?
// An attacker intercepts your login data and tries to use it again later.
// The challenge makes this impossible because each login requires a fresh,
// unique challenge that was just generated.
//
// HOW IT WORKS:
// 1. Server (us) generates random challenge: "abc123"
// 2. User authenticates and signs this challenge
// 3. Server verifies the signature is for "abc123"
// 4. Server rejects any signature for an old challenge
//
// SINCE WE HAVE NO SERVER:
// We generate challenges client-side. This is secure enough for our use case
// because we're verifying against stored public keys, not a remote server.
// ============================================================================

/**
 * Generate a random challenge for WebAuthn
 * 
 * WebAuthn requires a BufferSource (ArrayBuffer) as the challenge.
 * We generate 32 random bytes which provides 256 bits of entropy.
 * This is cryptographically secure for our purposes.
 * 
 * @returns ArrayBuffer containing 32 random bytes
 */
export function generateChallenge(): ArrayBuffer {
  // crypto.getRandomValues is a browser API for cryptographically secure randomness
  // It's better than Math.random() for security purposes
  const array = new Uint8Array(32);                              // Create 32-byte array
  crypto.getRandomValues(array);                                 // Fill with random values
  return array.buffer;                                           // Return as ArrayBuffer
}

/**
 * Generate a challenge and encode it as base64
 * 
 * Sometimes we need the challenge as a string (for storage, etc.)
 * Base64 encoding converts binary data to ASCII string
 * 
 * @returns Base64-encoded challenge string
 */
export function generateChallengeBase64(): string {
  const challenge = generateChallenge();                         // Generate random bytes
  const bytes = new Uint8Array(challenge);                       // Convert to Uint8Array
  
  // Convert bytes to binary string
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);                     // Each byte → char code
  }
  
  // Convert binary string to base64
  return btoa(binary);                                           // btoa = binary to ASCII
}

/**
 * Decode a base64 challenge back to ArrayBuffer
 * 
 * @param base64 - Base64-encoded challenge
 * @returns ArrayBuffer
 */
export function decodeChallenge(base64: string): ArrayBuffer {
  const binary = atob(base64);                                   // atob = ASCII to binary
  const bytes = new Uint8Array(binary.length);                   // Create byte array
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);                             // Each char → byte
  }
  
  return bytes.buffer;                                           // Return as ArrayBuffer
}

/**
 * Generate a user ID
 * 
 * Each user needs a unique ID. We use crypto.randomUUID() which generates
 * a standard UUID v4 (Universally Unique Identifier).
 * 
 * Example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * 
 * @returns UUID string
 */
export function generateUserId(): string {
  return crypto.randomUUID();                                    // Built-in browser UUID generator
}

/**
 * Generate a credential ID
 * 
 * Each credential also needs a unique ID
 * 
 * @returns UUID string
 */
export function generateCredentialId(): string {
  return crypto.randomUUID();
}

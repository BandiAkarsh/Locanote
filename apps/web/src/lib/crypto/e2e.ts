// ============================================================================
// END-TO-END ENCRYPTION UTILITIES
// ============================================================================

const roomKeys = new Map<string, Uint8Array>();

export function storeRoomKey(roomId: string, key: Uint8Array): void {
  roomKeys.set(roomId, key);
}

export function getRoomKey(roomId: string): Uint8Array | undefined {
  return roomKeys.get(roomId);
}

export function hasRoomKey(roomId: string): boolean {
  return roomKeys.has(roomId);
}

export function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
): { key: Uint8Array; salt: Uint8Array } {
  // Simple implementation - in production, use proper key derivation
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Use provided salt or generate new one
  const usedSalt = salt || crypto.getRandomValues(new Uint8Array(16));

  // Combine password and salt (simplified)
  const combined = new Uint8Array(passwordBytes.length + usedSalt.length);
  combined.set(passwordBytes);
  combined.set(usedSalt, passwordBytes.length);

  // Return a key derived from the combination (simplified)
  return {
    key: combined.slice(0, 32),
    salt: usedSalt,
  };
}

export function protectRoomWithPassword(
  roomId: string,
  password: string,
): void {
  const { key, salt } = deriveKeyFromPassword(password);
  storeRoomKey(roomId, key);
  // In a real implementation, you'd also store the salt with the room
}

export function uint8ArrayToBase64Url(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Restore padding
  const padding = 4 - (base64url.length % 4);
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + (padding === 4 ? 0 : padding), "=");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

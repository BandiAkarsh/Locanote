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

export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
): Promise<{ key: Uint8Array; salt: Uint8Array }> {
  // Use provided salt or generate new one (16 bytes = 128 bits)
  const usedSalt = salt || crypto.getRandomValues(new Uint8Array(16));

  // Import password as key material
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  // Derive 256-bit key using PBKDF2 with 100,000 iterations
  // This is computationally expensive to prevent brute-force attacks
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: usedSalt.buffer.slice(
        usedSalt.byteOffset,
        usedSalt.byteOffset + usedSalt.byteLength,
      ) as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256, // 256 bits = 32 bytes
  );

  return {
    key: new Uint8Array(derivedBits),
    salt: usedSalt,
  };
}

export async function protectRoomWithPassword(
  roomId: string,
  password: string,
): Promise<void> {
  const { key } = await deriveKeyFromPassword(password);
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

// ============================================================================
// BROWSER ENVIRONMENT UTILITIES
// ============================================================================
// Centralized utilities for browser environment detection.
// Use these instead of duplicating checks across the codebase.
//
// WHY?
// - Consistent detection logic across all modules
// - Single source of truth for browser APIs
// - Easier to maintain and test
// ============================================================================

/**
 * Check if code is running in a browser environment
 * Returns false during SSR (server-side rendering)
 */
export const isBrowser: boolean =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).window !== "undefined";

/**
 * Check if crypto API is available (browser with crypto support)
 */
export const hasCrypto: boolean =
  isBrowser && typeof (globalThis as any).crypto !== "undefined";

/**
 * Get the window object safely
 * Returns undefined during SSR
 */
export function getWindow(): Window | undefined {
  if (!isBrowser) return undefined;
  return (globalThis as any).window;
}

/**
 * Get the crypto object safely
 * Returns undefined during SSR or if crypto is not available
 */
export function getCrypto(): Crypto | undefined {
  if (!hasCrypto) return undefined;
  return (globalThis as any).crypto;
}

/**
 * Get the navigator object safely
 * Returns undefined during SSR
 */
export function getNavigator(): Navigator | undefined {
  if (!isBrowser) return undefined;
  return (globalThis as any).window?.navigator;
}

/**
 * Get localStorage safely
 * Returns undefined during SSR
 */
export function getLocalStorage(): Storage | undefined {
  if (!isBrowser) return undefined;
  return (globalThis as any).window?.localStorage;
}

/**
 * Check if WebAuthn/PublicKeyCredential is available
 */
export function isWebAuthnSupported(): boolean {
  if (!isBrowser) return false;
  const win = getWindow();
  return (
    win !== undefined &&
    (win as any).PublicKeyCredential !== undefined &&
    typeof (win as any).PublicKeyCredential === "function"
  );
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (!isBrowser) {
    throw new Error(
      "arrayBufferToBase64() can only be called in browser environment",
    );
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return (globalThis as any).btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (!isBrowser) {
    throw new Error(
      "base64ToArrayBuffer() can only be called in browser environment",
    );
  }

  const binary = (globalThis as any).atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert Uint8Array to Base64 string
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  if (!isBrowser) {
    throw new Error(
      "uint8ArrayToBase64() can only be called in browser environment",
    );
  }

  let binary = "";
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return (globalThis as any).btoa(binary);
}

/**
 * Generate a UUID using crypto.randomUUID or fallback
 */
export function generateUUID(): string {
  const crypto = getCrypto();
  if (crypto && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

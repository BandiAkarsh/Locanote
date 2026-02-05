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
  typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined";

/**
 * Check if crypto API is available (browser with crypto support)
 */
export const hasCrypto: boolean =
  isBrowser && typeof globalThis.crypto !== "undefined";

/**
 * Get the window object safely
 * Returns undefined during SSR
 */
export function getWindow(): Window | undefined {
  if (!isBrowser) return undefined;
  return globalThis.window;
}

/**
 * Get the crypto object safely
 * Returns undefined during SSR or if crypto is not available
 */
export function getCrypto(): Crypto | undefined {
  if (!hasCrypto) return undefined;
  return globalThis.crypto;
}

/**
 * Get the navigator object safely
 * Returns undefined during SSR
 */
export function getNavigator(): Navigator | undefined {
  if (!isBrowser) return undefined;
  return globalThis.window?.navigator;
}

/**
 * Get localStorage safely
 * Returns undefined during SSR
 */
export function getLocalStorage(): Storage | undefined {
  if (!isBrowser) return undefined;
  return globalThis.window?.localStorage;
}

/**
 * Check if WebAuthn/PublicKeyCredential is available
 */
export function isWebAuthnSupported(): boolean {
  if (!isBrowser) return false;
  const win = getWindow();
  return (
    win !== undefined &&
    win.PublicKeyCredential !== undefined &&
    typeof win.PublicKeyCredential === "function"
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
  return globalThis.btoa(binary);
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

  const binary = globalThis.atob(base64);
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
  return globalThis.btoa(binary);
}

/**
 * Convert Uint8Array to URL-safe Base64 string (base64url)
 * Replaces: + → -, / → _, and removes = padding
 * Safe for use in URLs without encoding issues
 */
export function uint8ArrayToBase64Url(array: Uint8Array): string {
  if (!isBrowser) {
    throw new Error(
      "uint8ArrayToBase64Url() can only be called in browser environment",
    );
  }

  let binary = "";
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i]);
  }
  const base64 = globalThis.btoa(binary);
  // Convert to URL-safe base64url format
  return base64
    .replace(/\+/g, "-") // Replace + with -
    .replace(/\//g, "_") // Replace / with _
    .replace(/=/g, ""); // Remove padding
}

/**
 * Convert URL-safe Base64 string (base64url) to Uint8Array
 * Handles: - → +, _ → /, and adds padding if needed
 */
export function base64UrlToUint8Array(base64url: string): Uint8Array {
  if (!isBrowser) {
    throw new Error(
      "base64UrlToUint8Array() can only be called in browser environment",
    );
  }

  // Convert from URL-safe format back to standard base64
  let base64 = base64url
    .replace(/-/g, "+") // Replace - with +
    .replace(/_/g, "/"); // Replace _ with /

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding === 2) {
    base64 += "==";
  } else if (padding === 3) {
    base64 += "=";
  }

  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

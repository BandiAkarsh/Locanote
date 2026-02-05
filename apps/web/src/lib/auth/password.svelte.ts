// ============================================================================
// PASSWORD AUTHENTICATION
// ============================================================================
// This file handles password-based authentication for users who can't or
// don't want to use passkeys (WebAuthn).
//
// WHY PASSWORDS?
// - Not all devices have biometric sensors (old laptops, some desktops)
// - Some users prefer passwords
// - Provides a fallback option
//
// HOW IT WORKS:
// 1. User creates password during registration
// 2. I hash the password using PBKDF2 (built into browser)
// 3. I store: salt + iteration count + hash
// 4. On login, I hash the input password with the same salt
// 5. If hashes match, password is correct
//
// SECURITY NOTES:
// - I use PBKDF2 with 100,000 iterations (computationally expensive)
// - Each user gets a unique random salt
// - I never store the actual password, only the hash
// - Even if database is stolen, passwords can't be easily cracked
//
// WHY NOT ARGON2?
// The user requested Argon2, but it's complex to run in browsers (requires
// WebAssembly). PBKDF2 is natively supported by all browsers via Web Crypto API,
// making it simpler and more reliable for my use case.
// ============================================================================

import { generateUserId, generateCredentialId } from "./challenge";
import { createUser, usernameExists } from "$db/users";
import { createCredential, getCredentialByType } from "$db/credentials";
import type {
  RegistrationResult,
  RegistrationError,
  PasswordValidationResult,
} from "./types";

// ============================================================================
// BROWSER ENVIRONMENT CHECK
// ============================================================================
// These functions require browser-only APIs (crypto, TextEncoder, btoa/atob)
// I check the environment to provide clear error messages during SSR

const isBrowser =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).window !== "undefined" &&
  typeof (globalThis as any).crypto !== "undefined";

// ============================================================================
// PASSWORD REQUIREMENTS
// ============================================================================
// Minimum requirements for a valid password

const MIN_LENGTH = 8; // At least 8 characters
const MIN_UPPERCASE = 1; // At least 1 uppercase
const MIN_DIGITS = 1; // At least 1 number

// ============================================================================
// PBKDF2 CONFIGURATION
// ============================================================================
// Parameters for the password hashing algorithm

const ITERATIONS = 100000; // Number of iterations (higher = more secure but slower)
const KEY_LENGTH = 256; // Output key length in bits (32 bytes)
const HASH_ALGORITHM = "SHA-256"; // Hash algorithm to use

// ============================================================================
// VALIDATE PASSWORD
// ============================================================================
// Checks if a password meets my requirements
//
// @param password - The password to validate
// @returns Validation result with isValid flag and optional error message

export function validatePassword(password: string): PasswordValidationResult {
  // Check minimum length
  if (password.length < MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${MIN_LENGTH} characters long.`,
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter.",
    };
  }

  // Check for digit
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number.",
    };
  }

  // Password meets all requirements
  return {
    isValid: true,
    error: null,
  };
}

// ============================================================================
// GENERATE SALT
// ============================================================================
// Creates a random salt for password hashing
// A salt ensures that two users with the same password have different hashes
//
// @returns Base64-encoded random salt (16 bytes)

function generateSalt(): string {
  if (!isBrowser) {
    throw new Error("generateSalt() can only be called in browser environment");
  }

  const array = new Uint8Array(16); // 16 bytes of salt
  (globalThis as any).crypto.getRandomValues(array); // Fill with random values
  return arrayToBase64(array); // Convert to base64 string
}

// ============================================================================
// HASH PASSWORD
// ============================================================================
// Hashes a password using PBKDF2
//
// @param password - The plain text password
// @param salt - The salt (base64 string)
// @returns Promise resolving to the hash (base64 string)

async function hashPassword(password: string, salt: string): Promise<string> {
  if (!isBrowser) {
    throw new Error("hashPassword() can only be called in browser environment");
  }

  // Convert inputs to proper formats
  const passwordBuffer = new TextEncoder().encode(password); // Password as bytes
  const saltBuffer = base64ToArray(salt); // Salt as bytes

  // Import the password as a CryptoKey
  const keyMaterial = await (globalThis as any).crypto.subtle.importKey(
    "raw", // Raw key material
    passwordBuffer,
    { name: "PBKDF2" }, // Algorithm
    false, // Not extractable
    ["deriveBits"], // Can only derive bits
  );

  // Derive the hash using PBKDF2
  const derivedBits = await (globalThis as any).crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH, // Output length in bits
  );

  // Convert result to base64
  return arrayToBase64(new Uint8Array(derivedBits));
}

// ============================================================================
// REGISTER WITH PASSWORD
// ============================================================================
// Main function to register a new user with a password
//
// @param username - The user's chosen display name
// @param password - The user's password (will be validated)
// @returns RegistrationResult on success, RegistrationError on failure

export async function registerWithPassword(
  username: string,
  password: string,
): Promise<RegistrationResult | RegistrationError> {
  try {
    // --------------------------------------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------------------------------------
    const validation = validatePassword(password); // Check requirements
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "Invalid password.",
        code: "INVALID_PASSWORD",
      };
    }

    // --------------------------------------------------------------------
    // CHECK USERNAME
    // --------------------------------------------------------------------
    const exists = await usernameExists(username); // Check if taken
    if (exists) {
      return {
        success: false,
        error: "Username already taken. Please choose a different one.",
        code: "USERNAME_EXISTS",
      };
    }

    // --------------------------------------------------------------------
    // GENERATE IDS AND SALT
    // --------------------------------------------------------------------
    const userId = generateUserId(); // Unique user ID
    const credentialId = generateCredentialId(); // Unique credential ID
    const salt = generateSalt(); // Random salt

    // --------------------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------------------
    const passwordHash = await hashPassword(password, salt); // Create hash

    // --------------------------------------------------------------------
    // SAVE TO DATABASE
    // --------------------------------------------------------------------
    const now = Date.now();

    // 1. Create user record
    await createUser({
      id: userId,
      username,
      createdAt: now,
      lastLoginAt: now,
    });

    // 2. Create credential record
    await createCredential({
      id: credentialId,
      userId,
      type: "password",
      passwordHash, // Store the hash
      salt, // Store the salt
      createdAt: now,
    });

    // --------------------------------------------------------------------
    // RETURN SUCCESS
    // --------------------------------------------------------------------
    return {
      success: true,
      userId,
      username,
      credentialId,
    };
  } catch (error) {
    // --------------------------------------------------------------------
    // HANDLE ERRORS
    // --------------------------------------------------------------------
    console.error("Password registration error:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
}

// ============================================================================
// VERIFY PASSWORD
// ============================================================================
// Verifies that a provided password matches the stored hash
// Used during login
//
// @param userId - The user's ID
// @param password - The password to verify
// @returns Promise<boolean> true if password is correct

export async function verifyPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  try {
    // Get the stored credential
    const credential = await getCredentialByType(userId, "password");
    if (!credential || !credential.passwordHash || !credential.salt) {
      return false; // No password credential found
    }

    // Hash the provided password with the stored salt
    const computedHash = await hashPassword(password, credential.salt);

    // Compare hashes (timing-safe comparison not needed for PBKDF2 output)
    return computedHash === credential.passwordHash;
  } catch (error) {
    console.error("Password verification error:", error);
    return false; // Any error = verification failed
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// Helper functions for base64 encoding/decoding

function arrayToBase64(array: Uint8Array): string {
  if (!isBrowser) {
    throw new Error(
      "arrayToBase64() can only be called in browser environment",
    );
  }

  let binary = "";
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return (globalThis as any).btoa(binary); // Binary to base64
}

function base64ToArray(base64: string): ArrayBuffer {
  if (!isBrowser) {
    throw new Error(
      "base64ToArray() can only be called in browser environment",
    );
  }

  const binary = (globalThis as any).atob(base64); // Base64 to binary
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer; // Return as ArrayBuffer
}

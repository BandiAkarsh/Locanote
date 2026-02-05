// ============================================================================
// CREDENTIALS DATABASE OPERATIONS
// ============================================================================
// Helper functions for storing and retrieving authentication credentials.
// Supports both passkeys (WebAuthn) and password hashes.
//
// SECURITY NOTES:
// - Passkey public keys are stored (safe - can't be used to forge signatures)
// - Password hashes are stored (safe - one-way function, can't reverse)
// - Private keys are NEVER stored (they stay in the browser/device)
// ============================================================================

import { getDB } from "./index"; // Import database getter
import type { Credential } from "./index"; // Import Credential type

// ============================================================================
// CREATE CREDENTIAL
// ============================================================================
// Adds a new credential to the database
//
// @param credential - The credential object to add
// @returns The added credential

export async function createCredential(
  credential: Credential,
): Promise<Credential> {
  const db = await getDB();
  await db.add("credentials", credential); // Add to 'credentials' store
  return credential;
}

// ============================================================================
// GET CREDENTIAL BY ID
// ============================================================================
// Retrieves a credential by its unique ID
//
// @param id - The credential's unique ID
// @returns The credential, or undefined if not found

export async function getCredentialById(
  id: string,
): Promise<Credential | undefined> {
  const db = await getDB();
  return db.get("credentials", id);
}

// ============================================================================
// GET CREDENTIALS BY USER
// ============================================================================
// Gets all credentials for a specific user
// A user might have multiple passkeys (e.g., laptop + phone)
//
// @param userId - The user's ID
// @returns Array of credentials

export async function getCredentialsByUser(
  userId: string,
): Promise<Credential[]> {
  const db = await getDB();
  const index = db.transaction("credentials").store.index("by-user");
  return index.getAll(userId); // Get all matching records
}

// ============================================================================
// GET CREDENTIAL BY TYPE
// ============================================================================
// Gets a credential of a specific type for a user
// Used to check if user has a passkey or password
//
// @param userId - The user's ID
// @param type - 'passkey' or 'password'
// @returns The credential, or undefined if not found

export async function getCredentialByType(
  userId: string,
  type: "passkey" | "password",
): Promise<Credential | undefined> {
  const credentials = await getCredentialsByUser(userId); // Get all user credentials
  return credentials.find((cred) => cred.type === type); // Filter by type
}

// ============================================================================
// DELETE CREDENTIAL
// ============================================================================
// Removes a single credential
//
// @param credentialId - The ID of credential to delete

export async function deleteCredential(credentialId: string): Promise<void> {
  const db = await getDB();
  await db.delete("credentials", credentialId);
}

// ============================================================================
// DELETE ALL CREDENTIALS FOR USER
// ============================================================================
// Removes all credentials belonging to a user
// Called when deleting a user account
//
// @param userId - The user's ID

export async function deleteCredentialsByUser(userId: string): Promise<void> {
  const db = await getDB();
  const credentials = await getCredentialsByUser(userId); // Get all user credentials

  // Delete each one
  const tx = db.transaction("credentials", "readwrite"); // Start transaction
  for (const cred of credentials) {
    await tx.store.delete(cred.id);
  }
  await tx.done; // Commit transaction
}

// ============================================================================
// CHECK IF USER HAS PASSKEY
// ============================================================================
// Quick check to see if user has registered any passkeys
//
// @param userId - The user's ID
// @returns True if user has at least one passkey

export async function hasPasskey(userId: string): Promise<boolean> {
  const passkey = await getCredentialByType(userId, "passkey"); // Look for passkey
  return !!passkey; // Convert to boolean
}

// ============================================================================
// CHECK IF USER HAS PASSWORD
// ============================================================================
// Quick check to see if user has set a password
//
// @param userId - The user's ID
// @returns True if user has a password

export async function hasPassword(userId: string): Promise<boolean> {
  const password = await getCredentialByType(userId, "password"); // Look for password
  return !!password;
}

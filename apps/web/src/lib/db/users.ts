// ============================================================================
// USER DATABASE OPERATIONS
// ============================================================================
// Helper functions for CRUD operations on the 'users' store.
// These functions make it easy to work with user data.
//
// WHAT IS CRUD?
// - Create (add new user)
// - Read (get user by ID or username)
// - Update (modify user data)
// - Delete (remove user)
//
// ALL FUNCTIONS ARE ASYNC (return Promises)
// because IndexedDB operations are asynchronous.
// ============================================================================

import { getDB } from "./index"; // Import database getter
import type { User } from "./index"; // Import User type

// ============================================================================
// CREATE USER
// ============================================================================
// Adds a new user to the database
//
// @param user - The user object to add (must have id, username, createdAt)
// @returns The added user

export async function createUser(user: User): Promise<User> {
  const db = await getDB(); // Get database instance
  await db.add("users", user); // Add user to 'users' store
  return user; // Return the user
}

// ============================================================================
// GET USER BY ID
// ============================================================================
// Retrieves a user by their unique ID
//
// @param id - The user's unique ID
// @returns The user, or undefined if not found

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get("users", id); // Get from 'users' store by key
}

// ============================================================================
// GET USER BY USERNAME
// ============================================================================
// Looks up a user by their username
// Returns undefined if no user with that username exists
//
// @param username - The username to search for
// @returns The user, or undefined if not found

export async function getUserByUsername(
  username: string,
): Promise<User | undefined> {
  const db = await getDB();
  const index = db.transaction("users").store.index("by-username"); // Get the username index
  return index.get(username); // Look up by username
}

// ============================================================================
// UPDATE USER
// ============================================================================
// Updates an existing user
// The user must already exist (will throw if not found)
//
// @param user - The user object with updated data
// @returns The updated user

export async function updateUser(user: User): Promise<User> {
  const db = await getDB();
  await db.put("users", user); // 'put' updates if exists, adds if not
  return user;
}

// ============================================================================
// UPDATE LAST LOGIN
// ============================================================================
// Convenience function to update just the lastLoginAt timestamp
//
// @param userId - The user's ID
// @returns The updated user, or undefined if user not found

export async function updateLastLogin(
  userId: string,
): Promise<User | undefined> {
  const user = await getUserById(userId); // Get current user
  if (!user) return undefined; // Return undefined if not found

  user.lastLoginAt = Date.now(); // Update timestamp
  return updateUser(user); // Save changes
}

// ============================================================================
// DELETE USER
// ============================================================================
// Removes a user from the database
// Also removes all their credentials, notes, and tags
//
// @param userId - The ID of user to delete

export async function deleteUser(userId: string): Promise<void> {
  const db = await getDB();

  // Delete user
  await db.delete("users", userId);

  // Also delete all related data (credentials, notes, tags)
  // I'll implement these helper functions next
  const { deleteCredentialsByUser } = await import("./credentials");
  const { deleteNotesByUser } = await import("./notes");
  const { deleteTagsByUser } = await import("./tags");

  await deleteCredentialsByUser(userId);
  await deleteNotesByUser(userId);
  await deleteTagsByUser(userId);
}

// ============================================================================
// CHECK IF USERNAME EXISTS
// ============================================================================
// Returns true if a user with this username already exists
// Useful for validation during registration
//
// @param username - The username to check
// @returns True if username is taken

export async function usernameExists(username: string): Promise<boolean> {
  const user = await getUserByUsername(username); // Try to find user
  return !!user; // Convert to boolean (!!undefined = false)
}

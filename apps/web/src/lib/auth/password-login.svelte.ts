// ============================================================================
// PASSWORD LOGIN
// ============================================================================
// This file handles logging in with a password.
//
// THE LOGIN FLOW:
// 1. User provides username and password
// 2. I look up the user by username
// 3. I get their stored credential (salt + hash)
// 4. I hash the provided password with the same salt
// 5. I compare the computed hash with stored hash
// 6. If match, user is logged in!
// ============================================================================

import { getUserByUsername, updateLastLogin } from "$db/users";
import { verifyPassword } from "./password.svelte";
import type { AuthResult, AuthError } from "./types";

// ============================================================================
// LOGIN WITH PASSWORD
// ============================================================================
// Main function to authenticate a user with their password
//
// @param username - The user's username
// @param password - The user's password
// @returns AuthResult on success, AuthError on failure

export async function loginWithPassword(
  username: string,
  password: string,
): Promise<AuthResult | AuthError> {
  try {
    // --------------------------------------------------------------------
    // VALIDATE INPUTS
    // --------------------------------------------------------------------
    if (!username || !password) {
      return {
        success: false,
        error: "Please enter both username and password.",
        code: "MISSING_CREDENTIALS",
      };
    }

    // --------------------------------------------------------------------
    // GET USER
    // --------------------------------------------------------------------
    const user = await getUserByUsername(username);
    if (!user) {
      return {
        success: false,
        error: "Invalid username or password.",
        code: "INVALID_CREDENTIALS",
      };
    }

    // --------------------------------------------------------------------
    // VERIFY PASSWORD
    // --------------------------------------------------------------------
    const isValid = await verifyPassword(user.id, password);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid username or password.",
        code: "INVALID_CREDENTIALS",
      };
    }

    // --------------------------------------------------------------------
    // UPDATE LAST LOGIN
    // --------------------------------------------------------------------
    await updateLastLogin(user.id);

    // --------------------------------------------------------------------
    // RETURN SUCCESS
    // --------------------------------------------------------------------
    return {
      success: true,
      userId: user.id,
      username: user.username,
      method: "password",
      credentialId: user.id, // Using userId as credentialId for passwords
    };
  } catch (error) {
    // --------------------------------------------------------------------
    // HANDLE ERRORS
    // --------------------------------------------------------------------
    console.error("Password login error:", error);
    return {
      success: false,
      error: "Login failed. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
}

// ============================================================================
// CHECK IF USER HAS PASSWORD
// ============================================================================
// Checks if a user has set up password authentication
//
// @param username - The username to check
// @returns Promise<boolean> true if user has password

export async function userHasPassword(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username);
    if (!user) return false;

    const { hasPassword } = await import("$db/credentials");
    return await hasPassword(user.id);
  } catch {
    return false;
  }
}

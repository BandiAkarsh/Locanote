// ============================================================================
// PASSWORD AUTH STRATEGY
// ============================================================================
// Implementation of AuthStrategy for password-based authentication.
// This wraps the existing password functions in a strategy pattern.
// ============================================================================

import type { AuthStrategy } from "./strategy";
import type {
  AuthResult,
  AuthError,
  RegistrationResult,
  RegistrationError,
} from "./types";
import { registerWithPassword } from "./password.svelte";
import { loginWithPassword } from "./password-login.svelte";

/**
 * Password authentication strategy.
 * Uses traditional username/password authentication with PBKDF2 hashing.
 */
export const passwordStrategy: AuthStrategy = {
  name: "password",
  displayName: "Password",
  description: "Use a secure password",

  async isAvailable(): Promise<boolean> {
    // Password auth is always available in browsers with Web Crypto
    if (typeof globalThis === "undefined") return false;
    if (typeof (globalThis as any).crypto === "undefined") return false;
    return typeof (globalThis as any).crypto.subtle !== "undefined";
  },

  async register(
    username: string,
    secret?: string,
  ): Promise<RegistrationResult | RegistrationError> {
    if (!secret) {
      return {
        success: false,
        error: "Password is required for registration.",
        code: "MISSING_PASSWORD",
      };
    }
    return registerWithPassword(username, secret);
  },

  async login(
    identifier: string,
    secret?: string,
  ): Promise<AuthResult | AuthError> {
    if (!secret) {
      return {
        success: false,
        error: "Password is required for login.",
        code: "MISSING_PASSWORD",
      };
    }
    return loginWithPassword(identifier, secret);
  },
};

/**
 * Create a password strategy instance.
 * Useful for custom configurations.
 */
export function createPasswordStrategy(): AuthStrategy {
  return { ...passwordStrategy };
}

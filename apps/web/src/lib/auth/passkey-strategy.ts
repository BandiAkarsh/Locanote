// ============================================================================
// PASSKEY AUTH STRATEGY
// ============================================================================
// Implementation of AuthStrategy for WebAuthn passkeys.
// This wraps the existing WebAuthn functions in a strategy pattern.
// ============================================================================

import type { AuthStrategy } from "./strategy";
import type {
  AuthResult,
  AuthError,
  RegistrationResult,
  RegistrationError,
} from "./types";
import {
  registerWithPasskey,
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
} from "./webauthn.svelte";
import { loginWithPasskey } from "./webauthn-login.svelte";

/**
 * Passkey (WebAuthn) authentication strategy.
 * Uses the device's biometric authentication (Face ID, Touch ID, Windows Hello, etc.)
 */
export const passkeyStrategy: AuthStrategy = {
  name: "passkey",
  displayName: "Passkey",
  description: "Use Face ID, Touch ID, or device PIN",

  async isAvailable(): Promise<boolean> {
    if (!isWebAuthnAvailable()) return false;
    return isPlatformAuthenticatorAvailable();
  },

  async register(
    username: string,
    _secret?: string, // Passkeys don't use a password
  ): Promise<RegistrationResult | RegistrationError> {
    return registerWithPasskey(username);
  },

  async login(
    _identifier: string, // Passkeys auto-identify the user
    _secret?: string,
  ): Promise<AuthResult | AuthError> {
    // For passkeys, the device handles user identification
    return loginWithPasskey();
  },
};

/**
 * Create a passkey strategy instance.
 * Useful for custom configurations.
 */
export function createPasskeyStrategy(): AuthStrategy {
  return { ...passkeyStrategy };
}

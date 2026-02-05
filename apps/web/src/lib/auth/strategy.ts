// ============================================================================
// AUTH STRATEGY INTERFACE
// ============================================================================
// Abstract interface for authentication strategies.
// This enables easy swapping of authentication implementations.
//
// CURRENT IMPLEMENTATIONS:
// - PasskeyStrategy (WebAuthn)
// - PasswordStrategy (PBKDF2)
//
// FUTURE IMPLEMENTATIONS COULD INCLUDE:
// - OAuthStrategy (Google, GitHub, etc.)
// - MagicLinkStrategy (Email)
// - TOTPStrategy (Authenticator apps)
//
// TO ADD A NEW AUTH METHOD:
// 1. Implement the AuthStrategy interface
// 2. Register it in the strategy registry
// 3. Update the UI to offer the new option
// ============================================================================

import type {
  AuthResult,
  AuthError,
  RegistrationResult,
  RegistrationError,
} from "./types";

// ============================================================================
// AUTH STRATEGY INTERFACE
// ============================================================================

/**
 * Abstract interface for authentication strategies.
 * Each strategy handles both registration and login for a specific auth method.
 */
export interface AuthStrategy {
  /** Unique identifier for this strategy (e.g., "passkey", "password") */
  readonly name: string;

  /** Human-readable display name (e.g., "Passkey", "Password") */
  readonly displayName: string;

  /** Description for UI (e.g., "Use Face ID or fingerprint") */
  readonly description: string;

  /**
   * Check if this auth method is available on the current device.
   * For example, passkeys require WebAuthn support.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Register a new user with this auth method.
   *
   * @param username - The user's chosen username
   * @param secret - The authentication secret (password, passphrase, etc.)
   *                 For passkeys, this may be undefined as the device handles it.
   * @returns Registration result or error
   */
  register(
    username: string,
    secret?: string,
  ): Promise<RegistrationResult | RegistrationError>;

  /**
   * Authenticate an existing user.
   *
   * @param identifier - User identifier (username, email, etc.)
   * @param secret - The authentication secret (password, passphrase, etc.)
   *                 For passkeys, this may be undefined as the device handles it.
   * @returns Authentication result or error
   */
  login(identifier: string, secret?: string): Promise<AuthResult | AuthError>;
}

// ============================================================================
// STRATEGY REGISTRY
// ============================================================================

/**
 * Registry of available authentication strategies.
 * Strategies are registered by name and can be looked up dynamically.
 */
const strategyRegistry = new Map<string, AuthStrategy>();

/**
 * Register an authentication strategy.
 * @param strategy - The strategy to register
 */
export function registerStrategy(strategy: AuthStrategy): void {
  strategyRegistry.set(strategy.name, strategy);
}

/**
 * Get a strategy by name.
 * @param name - The strategy name (e.g., "passkey", "password")
 * @returns The strategy or undefined if not found
 */
export function getStrategy(name: string): AuthStrategy | undefined {
  return strategyRegistry.get(name);
}

/**
 * Get all registered strategies.
 * @returns Array of all registered strategies
 */
export function getAllStrategies(): AuthStrategy[] {
  return Array.from(strategyRegistry.values());
}

/**
 * Get all available strategies (filtered by isAvailable).
 * @returns Promise resolving to array of available strategies
 */
export async function getAvailableStrategies(): Promise<AuthStrategy[]> {
  const strategies = getAllStrategies();
  const results = await Promise.all(
    strategies.map(async (s) => ({
      strategy: s,
      available: await s.isAvailable(),
    })),
  );
  return results.filter((r) => r.available).map((r) => r.strategy);
}

// ============================================================================
// STRATEGY ERROR TYPES
// ============================================================================

/**
 * Error thrown when a strategy is not found in the registry.
 */
export class StrategyNotFoundError extends Error {
  constructor(name: string) {
    super(`Authentication strategy not found: ${name}`);
    this.name = "StrategyNotFoundError";
  }
}

/**
 * Error thrown when a strategy is not available on the current device.
 */
export class StrategyNotAvailableError extends Error {
  constructor(name: string) {
    super(`Authentication strategy not available on this device: ${name}`);
    this.name = "StrategyNotAvailableError";
  }
}

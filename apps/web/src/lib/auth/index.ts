// ============================================================================
// AUTH MODULE EXPORTS
// ============================================================================
// Central export point for all authentication modules.
//
// ARCHITECTURE:
// - types.ts: Abstract type definitions
// - strategy.ts: AuthStrategy interface and registry
// - passkey-strategy.ts: WebAuthn implementation
// - password-strategy.ts: Password implementation
// - webauthn.svelte.ts, password.svelte.ts: Low-level implementations
//
// TO ADD A NEW AUTH METHOD:
// 1. Create a new *-strategy.ts file implementing AuthStrategy
// 2. Import and register it here
// 3. The UI will automatically pick it up via getAvailableStrategies()
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export * from "./types";

// ============================================================================
// STRATEGY PATTERN (NEW - Modular Architecture)
// ============================================================================

export type { AuthStrategy } from "./strategy";
export {
  registerStrategy,
  getStrategy,
  getAllStrategies,
  getAvailableStrategies,
  StrategyNotFoundError,
  StrategyNotAvailableError,
} from "./strategy";

// Strategy implementations
export { passkeyStrategy, createPasskeyStrategy } from "./passkey-strategy";
export { passwordStrategy, createPasswordStrategy } from "./password-strategy";

// ============================================================================
// LEGACY API (For Backward Compatibility)
// ============================================================================
// These exports maintain compatibility with existing code.
// New code should prefer the strategy pattern.

// WebAuthn (Passkey) authentication
export {
  registerWithPasskey,
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
} from "./webauthn.svelte";
export {
  loginWithPasskey,
  hasAvailablePasskey,
  setupConditionalUI,
} from "./webauthn-login.svelte";

// Password authentication
export {
  registerWithPassword,
  validatePassword,
  verifyPassword,
} from "./password.svelte";
export { loginWithPassword, userHasPassword } from "./password-login.svelte";

// Challenge generation
export {
  generateChallenge,
  generateUserId,
  generateCredentialId,
} from "./challenge";

// ============================================================================
// AUTO-REGISTER STRATEGIES
// ============================================================================
// Register built-in strategies on module load

import { registerStrategy } from "./strategy";
import { passkeyStrategy } from "./passkey-strategy";
import { passwordStrategy } from "./password-strategy";

// Register both strategies
registerStrategy(passkeyStrategy);
registerStrategy(passwordStrategy);

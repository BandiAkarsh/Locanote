// ============================================================================
// AUTH MODULE EXPORTS
// ============================================================================
// Central export point for all authentication modules

// Types
export * from './types';

// WebAuthn (Passkey) authentication
export { registerWithPasskey, isWebAuthnAvailable, isPlatformAuthenticatorAvailable } from './webauthn.svelte';
export { loginWithPasskey, hasAvailablePasskey, setupConditionalUI } from './webauthn-login.svelte';

// Password authentication
export { registerWithPassword, validatePassword, verifyPassword } from './password.svelte';
export { loginWithPassword, userHasPassword } from './password-login.svelte';

// Challenge generation
export { generateChallenge, generateUserId, generateCredentialId } from './challenge';

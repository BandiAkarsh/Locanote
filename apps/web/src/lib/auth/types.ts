// ============================================================================
// AUTHENTICATION TYPES AND INTERFACES (HARDENED)
// ============================================================================
// Type definitions for enterprise-grade authentication system
// Updated for 2026 security standards
//
// CHANGES FROM ORIGINAL:
// - Added rate limiting support
// - Added security event logging
// - Added device fingerprinting
// - Added MFA support
// - Added password policy enforcement
// - Enhanced session management
// ============================================================================

// ============================================================================
// AUTHENTICATION RESULTS
// ============================================================================

export interface AuthResult {
  success: true;
  userId: string;
  username: string;
  method: "passkey" | "password" | "recovery";
  credentialId?: string;
  sessionToken?: string;
  expiresAt: number;
  mfaRequired?: boolean;
}

export interface AuthError {
  success: false;
  error: string;
  code: AuthErrorCode;
  retryAfter?: number; // Seconds to wait before retry (for rate limiting)
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "RATE_LIMITED"
  | "DEVICE_NOT_SUPPORTED"
  | "REGISTRATION_FAILED"
  | "AUTHENTICATION_FAILED"
  | "ABORTED"
  | "UNKNOWN_ERROR"
  | "SESSION_EXPIRED"
  | "INVALID_SESSION"
  | "PASSWORD_TOO_WEAK"
  | "ACCOUNT_LOCKED"
  | "MFA_REQUIRED"
  | "MFA_INVALID"
  | "PASSWORD_EXPIRED";

// ============================================================================
// AUTHENTICATION STATE
// ============================================================================

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error"
  | "rate_limited"
  | "account_locked"
  | "mfa_required";

export interface AuthState {
  status: AuthStatus;
  message?: string;
  error?: string;
  retryAfter?: number;
  session?: UserSession;
}

export interface UserSession {
  userId: string;
  username: string;
  loggedInAt: number;
  expiresAt: number;
  lastActivityAt: number;
  method: "passkey" | "password";
  deviceFingerprint?: string;
  sessionToken?: string;
  mfaVerified?: boolean;
}

// ============================================================================
// REGISTRATION RESULTS
// ============================================================================

export interface RegistrationResult {
  success: true;
  userId: string;
  username: string;
  credentialId?: string;
  recoveryCodes?: string[]; // Backup codes for account recovery
}

export interface RegistrationError {
  success: false;
  error: string;
  code?: AuthErrorCode;
  retryAfter?: number;
}

// ============================================================================
// USER AND CREDENTIAL TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  createdAt: number;
  lastLoginAt: number;
  lastPasswordChange?: number;
  failedLoginAttempts: number;
  lockedUntil?: number;
  passwordHistory?: string[]; // Hashes of previous passwords
  mfaEnabled?: boolean;
  mfaSecret?: string; // Encrypted TOTP secret
  emailVerified?: boolean;
}

export interface Credential {
  id: string;
  userId: string;
  type: "passkey" | "password";
  // Passkey fields
  publicKey?: ArrayBuffer;
  credentialId?: ArrayBuffer;
  // Password fields
  passwordHash?: string; // Argon2id hash
  salt?: string;
  // Common fields
  createdAt: number;
  lastUsedAt?: number;
  metadata?: CredentialMetadata;
}

export interface CredentialMetadata {
  deviceName?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "security_key";
  browser?: string;
  os?: string;
  location?: string;
  ipHash?: string; // Hashed IP for privacy
  trustLevel?: "untrusted" | "basic" | "trusted" | "highly_trusted";
}

// ============================================================================
// WEBAUTHN SPECIFIC TYPES
// ============================================================================

export interface PasskeyRegistrationOptions {
  challenge: Uint8Array;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: Uint8Array;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
}

export interface PasskeyAuthenticationOptions {
  challenge: Uint8Array;
  rpId: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpires?: number;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  exponentialBackoff: boolean;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
  exponentialBackoff: true,
};

// ============================================================================
// SECURITY EVENTS
// ============================================================================

export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "login_rate_limited"
  | "logout"
  | "session_expired"
  | "session_renewed"
  | "password_changed"
  | "passkey_registered"
  | "passkey_removed"
  | "account_locked"
  | "account_unlocked"
  | "suspicious_activity"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_verified"
  | "recovery_code_used";

export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  timestamp: number;
  ipHash?: string;
  userAgentHash?: string;
  deviceFingerprint?: string;
  metadata?: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
}

// ============================================================================
// PASSWORD POLICY
// ============================================================================

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minEntropyBits: number;
  preventCommonPasswords: boolean;
  maxAge?: number; // Days until password must be changed
  historyCount?: number; // Number of previous passwords to prevent reuse
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minEntropyBits: 50,
  preventCommonPasswords: true,
  maxAge: 90, // 90 days
  historyCount: 5,
};

// Common passwords to reject
export const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "letmein",
  "dragon",
  "111111",
  "baseball",
  "iloveyou",
  "trustno1",
  "sunshine",
  "princess",
  "admin",
  "welcome",
  "shadow",
  "ashley",
  "football",
  "jesus",
  "michael",
  "ninja",
  "mustang",
  "password1",
  "123456789",
  "adobe123",
  "admin123",
  "root",
  "toor",
  "guest",
  "default",
  "changeme",
  "password123",
  "qwerty123",
]);

// ============================================================================
// AUTH STRATEGY INTERFACE
// ============================================================================

export interface AuthStrategy {
  readonly name: string;
  readonly displayName: string;
  readonly requiresPassword: boolean;

  isAvailable(): Promise<boolean>;

  register(
    username: string,
    secret?: string,
  ): Promise<RegistrationResult | RegistrationError>;

  login(identifier: string, secret?: string): Promise<AuthResult | AuthError>;

  canLogin?(identifier: string): Promise<boolean>;
}

// ============================================================================
// DEVICE FINGERPRINTING
// ============================================================================

export interface DeviceFingerprint {
  hash: string;
  components: {
    userAgent: string;
    language: string;
    colorDepth: number;
    screenResolution: string;
    timezone: string;
    sessionStorage: boolean;
    localStorage: boolean;
    indexedDB: boolean;
    cpuClass?: string;
    platform: string;
    canvas?: string; // Canvas fingerprint (privacy-sensitive, use sparingly)
  };
}

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

export interface SessionConfig {
  // Absolute maximum session duration
  absoluteMaxAge: number; // milliseconds (default: 7 days)
  // Inactivity timeout
  inactivityTimeout: number; // milliseconds (default: 30 minutes)
  // Sliding window renewal
  slidingWindow: boolean;
  // Require re-auth for sensitive operations
  requireReauthFor: string[]; // operation names
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  absoluteMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes
  slidingWindow: true,
  requireReauthFor: ["delete_account", "export_keys", "change_password"],
};

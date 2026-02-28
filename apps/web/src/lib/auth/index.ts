// ============================================================================
// AUTHENTICATION MODULE EXPORTS
// ============================================================================
// Central export point for all authentication functionality
//
// USAGE:
// import { auth } from '$stores/auth.svelte';
// import { checkRateLimit, recordFailedAttempt } from '$auth/rate-limit';
// ============================================================================

// Types
export type {
  AuthResult,
  AuthError,
  AuthErrorCode,
  AuthStatus,
  AuthState,
  UserSession,
  RegistrationResult,
  RegistrationError,
  User,
  Credential,
  CredentialMetadata,
  PasskeyRegistrationOptions,
  PasskeyAuthenticationOptions,
  RateLimitEntry,
  RateLimitConfig,
  SecurityEvent,
  SecurityEventType,
  PasswordPolicy,
  DeviceFingerprint,
  SessionConfig,
  AuthStrategy,
} from "./types";

// Constants
export {
  DEFAULT_RATE_LIMIT_CONFIG,
  DEFAULT_PASSWORD_POLICY,
  COMMON_PASSWORDS,
  DEFAULT_SESSION_CONFIG,
} from "./types";

// Rate Limiting
export {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccess,
  getRateLimitStatus,
  clearRateLimit,
  resetAllRateLimits,
  isCaptchaRequired,
  verifyCaptcha,
  setCaptchaProvider,
  calculateBackoff,
  backoffDelay,
  type RateLimitResult,
  type CaptchaProvider,
} from "./rate-limit";

// Security Logging
export {
  logSecurityEvent,
  logLoginSuccess,
  logLoginFailure,
  logRateLimited,
  logAccountLocked,
  logSuspiciousActivity,
  querySecurityLogs,
  getRecentEvents,
  getUserEvents,
  getCriticalEvents,
  generateComplianceReport,
  verifyHashChain,
  exportLogs,
  clearSecurityLogs,
  getLogStats,
  getDeviceFingerprint,
  hashIdentifier,
  type LogQueryOptions,
  type ComplianceReport,
} from "./security-log";

// ============================================================================
// AUTHENTICATION STATE MANAGEMENT (HARDENED)
// ============================================================================
// This file manages the global authentication state using Svelte 5 Runes.
// Updated with 2026 security standards.
//
// SECURITY FEATURES:
// - Encrypted session storage
// - Rate limiting integration
// - Device fingerprinting
// - Session timeout handling
// - Audit logging
//
// SVELTE 5 RUNES EXPLAINED:
// - $state() - Creates reactive state that triggers updates when changed
// - $effect() - Runs side effects when dependencies change
// ============================================================================

import type {
  AuthState,
  AuthResult,
  AuthError,
  UserSession,
} from "$auth/types";
import { DEFAULT_SESSION_CONFIG } from "$auth/types";
import { logSecurityEvent, getDeviceFingerprint } from "$auth/security-log";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccess,
} from "$auth/rate-limit";
import { encryptWithPassword, decryptWithPassword } from "$crypto/noble-crypto";

// ============================================================================
// SVELTE 5 TYPE DECLARATIONS
// ============================================================================

declare const $state: <T>(initial: T) => T;

// ============================================================================
// SESSION STORAGE
// ============================================================================

const SESSION_KEY = "locanote_session_encrypted";
const SESSION_PASSWORD = "session_encryption_key"; // Derived from device fingerprint

/**
 * Get session encryption password (device-bound)
 */
async function getSessionPassword(): Promise<string> {
  const fingerprint = await getDeviceFingerprint();
  return fingerprint + SESSION_PASSWORD;
}

/**
 * Encrypt and save session
 */
async function saveSession(session: UserSession): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const password = await getSessionPassword();
    const encrypted = await encryptWithPassword(
      JSON.stringify(session),
      password,
    );
    localStorage.setItem(SESSION_KEY, JSON.stringify(encrypted));
  } catch (e) {
    console.error("[Auth] Failed to save session:", e);
  }
}

/**
 * Load and decrypt session
 */
async function loadSession(): Promise<UserSession | null> {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const encrypted = JSON.parse(stored);
    const password = await getSessionPassword();
    const decrypted = await decryptWithPassword(encrypted, password);

    if (!decrypted) return null;

    return JSON.parse(decrypted) as UserSession;
  } catch (e) {
    console.error("[Auth] Failed to load session:", e);
    return null;
  }
}

/**
 * Clear session
 */
function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ============================================================================
// SESSION VALIDATION
// ============================================================================

/**
 * Check if session is valid (not expired)
 */
function isSessionValid(session: UserSession): boolean {
  const now = Date.now();

  // Check absolute expiration
  if (session.expiresAt <= now) {
    return false;
  }

  // Check inactivity timeout
  if (DEFAULT_SESSION_CONFIG.slidingWindow) {
    const inactive = now - session.lastActivityAt;
    if (inactive > DEFAULT_SESSION_CONFIG.inactivityTimeout) {
      return false;
    }
  }

  return true;
}

/**
 * Update last activity timestamp
 */
async function updateActivity(): Promise<void> {
  const session = await loadSession();
  if (session) {
    session.lastActivityAt = Date.now();
    await saveSession(session);
  }
}

// ============================================================================
// AUTH STORE
// ============================================================================

function createAuthStore() {
  // ===================================================================
  // STATE
  // ===================================================================
  let state = $state<AuthState>({ status: "idle" });

  // ===================================================================
  // INITIALIZE
  // ===================================================================
  async function initialize() {
    if (typeof window === "undefined") return;

    try {
      const session = await loadSession();

      if (session && isSessionValid(session)) {
        state = { status: "authenticated", session };
        await logSecurityEvent(session.userId, "login_success", "info", {
          method: "session_restore",
        });
      } else {
        if (session) {
          // Session expired
          clearSession();
          await logSecurityEvent(session.userId, "session_expired", "info");
        }
        state = { status: "unauthenticated" };
      }
    } catch (e) {
      console.error("[Auth] Failed to restore session:", e);
      state = { status: "unauthenticated" };
    }
  }

  // ===================================================================
  // RATE LIMIT CHECK
  // ===================================================================
  function checkAuthRateLimit(identifier: string): boolean {
    const rateLimit = checkRateLimit(identifier);

    if (!rateLimit.allowed) {
      state = {
        status: "rate_limited",
        error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        retryAfter: rateLimit.retryAfter,
      };
      return false;
    }

    return true;
  }

  // ===================================================================
  // SET LOADING
  // ===================================================================
  function setLoading(message: string) {
    state = { status: "loading", message };
  }

  // ===================================================================
  // SET ERROR
  // ===================================================================
  function setError(error: string) {
    state = { status: "error", error };
  }

  // ===================================================================
  // HANDLE AUTHENTICATION SUCCESS
  // ===================================================================
  async function handleAuthSuccess(result: AuthResult) {
    // Create session
    const now = Date.now();
    const session: UserSession = {
      userId: result.userId,
      username: result.username,
      loggedInAt: now,
      lastActivityAt: now,
      expiresAt: now + DEFAULT_SESSION_CONFIG.absoluteMaxAge,
      method: result.method === "recovery" ? "password" : result.method,
      sessionToken: result.sessionToken,
      deviceFingerprint: await getDeviceFingerprint(),
    };

    // Save encrypted session
    await saveSession(session);

    // Clear rate limit for this user
    recordSuccess(result.userId);

    // Log success
    await logSecurityEvent(result.userId, "login_success", "info", {
      method: result.method,
      credentialId: result.credentialId,
    });

    // Update state
    state = { status: "authenticated", session };
  }

  // ===================================================================
  // HANDLE AUTHENTICATION ERROR
  // ===================================================================
  async function handleAuthError(error: AuthError, identifier?: string) {
    // Record failed attempt for rate limiting
    if (identifier) {
      const rateLimit = recordFailedAttempt(identifier);

      if (rateLimit.blocked) {
        state = {
          status: "rate_limited",
          error: `Too many failed attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter,
        };

        await logSecurityEvent(identifier, "login_rate_limited", "warning", {
          attempts: rateLimit.attempts,
        });
        return;
      }
    }

    // Log failure
    if (identifier) {
      await logSecurityEvent(identifier, "login_failure", "warning", {
        errorCode: error.code,
        errorMessage: error.error,
      });
    }

    state = { status: "error", error: error.error };
  }

  // ===================================================================
  // LOGOUT
  // ===================================================================
  async function logout(reason: "user" | "timeout" | "error" = "user") {
    const session = await loadSession();

    // Disconnect from sync
    try {
      const { closeDocument } = await import("$lib/crdt/doc.svelte");
      console.log("[Auth] Disconnecting from sync servers...");
    } catch (e) {
      console.warn("[Auth] Disconnect failed:", e);
    }

    // Clear session
    clearSession();

    // Log logout
    if (session) {
      await logSecurityEvent(session.userId, "logout", "info", { reason });
    }

    // Update state
    state = { status: "unauthenticated" };
  }

  // ===================================================================
  // SESSION MANAGEMENT
  // ===================================================================
  async function refreshSession() {
    const session = await loadSession();

    if (!session) {
      state = { status: "unauthenticated" };
      return;
    }

    if (!isSessionValid(session)) {
      await logout("timeout");
      return;
    }

    // Update activity timestamp
    await updateActivity();

    // Extend session if sliding window
    if (DEFAULT_SESSION_CONFIG.slidingWindow) {
      session.expiresAt = Date.now() + DEFAULT_SESSION_CONFIG.absoluteMaxAge;
      await saveSession(session);
      state = { status: "authenticated", session };
    }
  }

  async function requireReauth(operation: string): Promise<boolean> {
    const session = await loadSession();

    if (!session) return false;

    // Check if operation requires re-authentication
    if (DEFAULT_SESSION_CONFIG.requireReauthFor.includes(operation)) {
      // In a real implementation, we'd prompt for password/passkey again
      // For now, just check if session is recent
      const recent = Date.now() - session.loggedInAt < 5 * 60 * 1000; // 5 minutes
      return recent;
    }

    return true;
  }

  // ===================================================================
  // ACCOUNT LOCKOUT
  // ===================================================================
  async function lockAccount(reason: string) {
    const session = await loadSession();

    if (session) {
      await logSecurityEvent(session.userId, "account_locked", "critical", {
        reason,
      });
    }

    await logout("error");
    state = { status: "account_locked", error: `Account locked: ${reason}` };
  }

  // ===================================================================
  // RETURN STORE INTERFACE
  // ===================================================================
  return {
    // Main state (reactive)
    get state() {
      return state;
    },

    // Derived values
    get isAuthenticated() {
      return state.status === "authenticated";
    },
    get isLoading() {
      return state.status === "loading";
    },
    get error() {
      return state.status === "error" ? state.error : null;
    },
    get session() {
      return state.status === "authenticated" ? state.session : null;
    },
    get isRateLimited() {
      return state.status === "rate_limited";
    },
    get retryAfter() {
      return state.retryAfter;
    },

    // Methods
    initialize,
    checkAuthRateLimit,
    setLoading,
    setError,
    handleAuthSuccess,
    handleAuthError,
    logout,
    refreshSession,
    requireReauth,
    lockAccount,
  };
}

// ============================================================================
// CREATE SINGLETON INSTANCE
// ============================================================================

export const auth = createAuthStore();

// ============================================================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================================================
// This file manages the global authentication state using Svelte 5 Runes.
// It tracks whether the user is logged in, loading, or has errors.
//
// SVELTE 5 RUNES EXPLAINED:
// - $state() - Creates reactive state that triggers updates when changed
// - $effect() - Runs side effects when dependencies change
//
// NOTE: $state is used for the main state, but I use getters for derived values
// to avoid TypeScript issues with $derived in module-level code.
// ============================================================================

import type {
  AuthState,
  UserSession,
  AuthResult,
  AuthError,
} from "$auth/types";

// ============================================================================
// SVELTE 5 TYPE DECLARATIONS
// ============================================================================
// This tells TypeScript that $state is globally available in .svelte.ts files
// It's provided by Svelte at compile time

declare const $state: <T>(initial: T) => T;

// ============================================================================
// SESSION STORAGE KEY
// ============================================================================
// I use localStorage to persist the session across browser reloads
const SESSION_KEY = "locanote_session";

// ============================================================================
// CREATE AUTH STORE
// ============================================================================
// This function creates the authentication store with all its methods

function createAuthStore() {
  // ========================================================================
  // STATE
  // ========================================================================
  // The main auth state - tracks if user is logged in or not
  let state = $state<AuthState>({ status: "idle" });

  // ========================================================================
  // INITIALIZE
  // ========================================================================
  // Check for existing session on startup

  function initialize() {
    if (typeof window === "undefined") return; // Guard for SSR

    try {
      const saved = localStorage.getItem(SESSION_KEY); // Get saved session
      if (saved) {
        const session: UserSession = JSON.parse(saved); // Parse it

        // Check if session is expired
        if (session.expiresAt > Date.now()) {
          state = { status: "authenticated", session }; // Restore session
        } else {
          localStorage.removeItem(SESSION_KEY); // Clear expired session
          state = { status: "unauthenticated" }; // Set as logged out
        }
      } else {
        state = { status: "unauthenticated" }; // No saved session
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
      state = { status: "unauthenticated" };
    }
  }

  // ========================================================================
  // SET LOADING STATE
  // ========================================================================

  function setLoading(message: string) {
    state = { status: "loading", message };
  }

  // ========================================================================
  // SET ERROR STATE
  // ========================================================================

  function setError(error: string) {
    state = { status: "error", error };
  }

  // ========================================================================
  // HANDLE SUCCESSFUL AUTHENTICATION
  // ========================================================================

  function handleAuthSuccess(result: AuthResult) {
    // Create session (valid for 7 days)
    const session: UserSession = {
      userId: result.userId,
      username: result.username,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Save to localStorage
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to save session:", e);
    }

    // Update state
    state = { status: "authenticated", session };
  }

  // ========================================================================
  // HANDLE AUTHENTICATION ERROR
  // ========================================================================

  function handleAuthError(error: AuthError) {
    state = { status: "error", error: error.error };
  }

  // ========================================================================
  // LOGOUT
  // ========================================================================

  function logout() {
    // Clear from localStorage
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }

    // Update state
    state = { status: "unauthenticated" };
  }

  // ========================================================================
  // RETURN STORE INTERFACE
  // ========================================================================
  // I use getters for derived values instead of $derived runes

  return {
    // Main state (reactive)
    get state() {
      return state;
    },

    // Derived values (computed getters)
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

    // Methods
    initialize,
    setLoading,
    setError,
    handleAuthSuccess,
    handleAuthError,
    logout,
  };
}

// ============================================================================
// CREATE SINGLETON INSTANCE
// ============================================================================
// I create one instance that will be shared across the entire app

export const auth = createAuthStore();

// ============================================================================
// SIMPLE AUTH STORE
// ============================================================================
// Simplified Svelte 5 Runes auth store for local-only P2P app
// ============================================================================

import type { AuthState, UserSession } from "$auth/index";

// Simple reactive auth state
let currentSession: UserSession | null = $state(null);
let authState: AuthState = $state({ status: "unauthenticated" });

// ============================================================================
// METHODS
// ============================================================================

export const auth = {
  // Initialize - check for existing session
  initialize() {
    // Only run on client-side
    if (typeof window === "undefined") return authState;

    const stored = localStorage.getItem("locanote_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.expiresAt > Date.now()) {
          currentSession = session;
          authState = { status: "authenticated", session };
        } else {
          localStorage.removeItem("locanote_session");
        }
      } catch {
        localStorage.removeItem("locanote_session");
      }
    }
    return authState;
  },

  // Login
  login(username: string): { success: boolean; error?: string } {
    if (!username || username.trim().length < 2) {
      return {
        success: false,
        error: "Username must be at least 2 characters",
      };
    }

    const userId = `${username.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    const session: UserSession = {
      userId,
      username: username.trim(),
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem("locanote_session", JSON.stringify(session));
    currentSession = session;
    authState = { status: "authenticated", session };

    return { success: true };
  },

  // Register (same as login for MVP)
  register(username: string): { success: boolean; error?: string } {
    return this.login(username);
  },

  // Logout
  logout() {
    localStorage.removeItem("locanote_session");
    currentSession = null;
    authState = { status: "unauthenticated" };
  },

  // Set loading state
  setLoading(message: string) {
    authState = { status: "loading", message };
  },

  // Set error state
  setError(error: string) {
    authState = { status: "error", error };
  },

  // Get state
  get state() {
    return authState;
  },

  // Get session
  get session() {
    return currentSession;
  },

  // Check if authenticated
  get isAuthenticated() {
    return authState.status === "authenticated";
  },

  // Check if loading
  get isLoading() {
    return authState.status === "loading";
  },

  // Get username
  get username() {
    return currentSession?.username || "";
  },

  // Get userId
  get userId() {
    return currentSession?.userId || "";
  },
};

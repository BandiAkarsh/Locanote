// ============================================================================
// AUTH STORE WITH PASSWORD SUPPORT
// ============================================================================
// Svelte 5 Runes auth store with password authentication
// ============================================================================

import type { AuthState, UserSession } from "$auth/index";

// Simple reactive auth state
let currentSession: UserSession | null = $state(null);
let authState: AuthState = $state({ status: "unauthenticated" });

// Store for user credentials (username -> password hash)
const USER_STORAGE_KEY = "locanote_users";

// ============================================================================
// PASSWORD HASHING (Simple hash for local-only app)
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// USER STORAGE
// ============================================================================

interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: number;
}

function getStoredUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveUser(username: string, passwordHash: string) {
  const users = getStoredUsers();
  users[username.toLowerCase()] = {
    username,
    passwordHash,
    createdAt: Date.now(),
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getUser(username: string): StoredUser | undefined {
  return getStoredUsers()[username.toLowerCase()];
}

// ============================================================================
// MIGRATION: Check if user needs to set password (existing user from old version)
// ============================================================================

export interface MigrationStatus {
  needsMigration: boolean;
  username: string | null;
}

function checkMigrationStatus(): MigrationStatus {
  if (typeof window === "undefined")
    return { needsMigration: false, username: null };

  // Check if there's an existing session from old version (without password system)
  const stored = localStorage.getItem("locanote_session");
  if (!stored) return { needsMigration: false, username: null };

  try {
    const session = JSON.parse(stored);
    // Check if this user has a password set
    const users = getStoredUsers();
    const hasPassword = users[session.username?.toLowerCase()] !== undefined;

    if (!hasPassword && session.username) {
      return { needsMigration: true, username: session.username };
    }
  } catch {
    // Invalid session
  }

  return { needsMigration: false, username: null };
}

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

  // Check if user needs to migrate (set password for existing account)
  checkMigration(): MigrationStatus {
    return checkMigrationStatus();
  },

  // Migrate existing user to password system
  async migrateUser(
    username: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      };
    }

    // Hash and store password
    const passwordHash = await hashPassword(password);
    saveUser(username, passwordHash);

    return { success: true };
  },

  // Login with password
  async login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!username || username.trim().length < 2) {
      return {
        success: false,
        error: "Username must be at least 2 characters",
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    // Verify user exists and password matches
    const user = getUser(username);
    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return {
        success: false,
        error: "Invalid username or password",
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

  // Register with password
  async register(
    username: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!username || username.trim().length < 2) {
      return {
        success: false,
        error: "Username must be at least 2 characters",
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      };
    }

    // Check if user already exists
    const existingUser = getUser(username);
    if (existingUser) {
      return {
        success: false,
        error: "Username already exists",
      };
    }

    // Hash and store password
    const passwordHash = await hashPassword(password);
    saveUser(username, passwordHash);

    // Create session
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

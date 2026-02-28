// ============================================================================
// SIMPLE AUTHENTICATION MODULE
// ============================================================================
// Local-only auth for P2P note-taking app
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface AuthResult {
  success: boolean;
  userId?: string;
  username?: string;
  error?: string;
}

export interface UserSession {
  userId: string;
  username: string;
  loggedInAt: number;
  expiresAt: number;
}

export type AuthState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "authenticated"; session: UserSession }
  | { status: "unauthenticated" }
  | { status: "error"; error: string };

// ============================================================================
// SIMPLE AUTH FUNCTIONS
// ============================================================================

function generateUserId(username: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${username.toLowerCase().replace(/\s+/g, "_")}_${timestamp}_${random}`;
}

/**
 * Login with username (local only - no password required for MVP)
 */
export function login(username: string): AuthResult {
  if (!username || username.trim().length < 2) {
    return { success: false, error: "Username must be at least 2 characters" };
  }

  const userId = generateUserId(username);
  const session: UserSession = {
    userId,
    username: username.trim(),
    loggedInAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  // Save to localStorage
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("locanote_session", JSON.stringify(session));
  }

  return { success: true, userId, username: session.username };
}

/**
 * Register new user (local only)
 */
export function register(username: string): AuthResult {
  return login(username);
}

/**
 * Logout and clear session
 */
export function logout(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("locanote_session");
  }
}

/**
 * Check if user is logged in (restore session)
 */
export function checkAuth(): UserSession | null {
  if (typeof localStorage === "undefined") return null;

  const stored = localStorage.getItem("locanote_session");
  if (!stored) return null;

  try {
    const session: UserSession = JSON.parse(stored);

    // Check if expired
    if (session.expiresAt < Date.now()) {
      logout();
      return null;
    }

    return session;
  } catch {
    logout();
    return null;
  }
}

/**
 * Get current session
 */
export function getSession(): UserSession | null {
  return checkAuth();
}

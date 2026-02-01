const SESSION_KEY = "locanote_session";
function createAuthStore() {
  let state = { status: "idle" };
  function initialize() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        if (session.expiresAt > Date.now()) {
          state = { status: "authenticated", session };
        } else {
          localStorage.removeItem(SESSION_KEY);
          state = { status: "unauthenticated" };
        }
      } else {
        state = { status: "unauthenticated" };
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
      state = { status: "unauthenticated" };
    }
  }
  function setLoading(message) {
    state = { status: "loading", message };
  }
  function setError(error) {
    state = { status: "error", error };
  }
  function handleAuthSuccess(result) {
    const session = {
      userId: result.userId,
      username: result.username,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1e3
      // 7 days
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
    state = { status: "authenticated", session };
  }
  function handleAuthError(error) {
    state = { status: "error", error: error.error };
  }
  function logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
    state = { status: "unauthenticated" };
  }
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
    logout
  };
}
const auth = createAuthStore();
export {
  auth as a
};

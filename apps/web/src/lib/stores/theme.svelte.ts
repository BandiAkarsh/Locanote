// ============================================================================
// THEME STORE
// ============================================================================
// Reactive store that manages the application's color theme and accent color.
// Supports 'light', 'dark', and 'system' modes.
// ============================================================================

import { isBrowser, getLocalStorage, getWindow } from "$utils/browser";

// Theme types
export type Theme = "light" | "dark" | "system";
export type AccentColor =
  | "indigo"
  | "violet"
  | "rose"
  | "emerald"
  | "amber"
  | "blue"
  | "fuchsia";

// Storage keys
const THEME_KEY = "locanote-theme";
const ACCENT_KEY = "locanote-accent";

// Default values
const DEFAULT_THEME: Theme = "system";
const DEFAULT_ACCENT: AccentColor = "indigo";

// Get stored values
function getStoredTheme(): Theme {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_THEME;
  const stored = storage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored as Theme;
  }
  return DEFAULT_THEME;
}

function getStoredAccent(): AccentColor {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_ACCENT;
  const stored = storage.getItem(ACCENT_KEY);
  const validAccents: AccentColor[] = [
    "indigo",
    "violet",
    "rose",
    "emerald",
    "amber",
    "blue",
    "fuchsia",
  ];
  if (validAccents.includes(stored as AccentColor)) {
    return stored as AccentColor;
  }
  return DEFAULT_ACCENT;
}

// Check if system prefers dark mode
function systemPrefersDark(): boolean {
  const win = getWindow();
  if (!win) return false;
  return win.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Theme Store
 * Manages light/dark/system theme and accent colors with persistence.
 */
function createThemeStore() {
  // Reactive state
  let currentTheme = $state<Theme>(getStoredTheme());
  let currentAccent = $state<AccentColor>(getStoredAccent());
  let systemDark = $state<boolean>(systemPrefersDark());

  // Listen for system theme changes
  if (isBrowser) {
    const win = getWindow();
    const mediaQuery = win?.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery) {
      const handler = (e: MediaQueryListEvent) => {
        systemDark = e.matches;
      };
      mediaQuery.addEventListener("change", handler);
    }
  }

  // Derived state
  const isDark = $derived(
    currentTheme === "dark" || (currentTheme === "system" && systemDark),
  );

  return {
    get current(): Theme {
      return currentTheme;
    },
    set current(value: Theme) {
      currentTheme = value;
      const storage = getLocalStorage();
      if (storage) storage.setItem(THEME_KEY, value);
    },
    get accent(): AccentColor {
      return currentAccent;
    },
    set accent(value: AccentColor) {
      currentAccent = value;
      const storage = getLocalStorage();
      if (storage) storage.setItem(ACCENT_KEY, value);
    },
    get isDark(): boolean {
      return isDark;
    },
    toggle() {
      currentTheme = isDark ? "light" : "dark";
      const storage = getLocalStorage();
      if (storage) storage.setItem(THEME_KEY, currentTheme);
    },
    setLight() {
      this.current = "light";
    },
    setDark() {
      this.current = "dark";
    },
    setSystem() {
      this.current = "system";
    },
  };
}

// Export singleton instance
export const theme = createThemeStore();

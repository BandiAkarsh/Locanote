// ============================================================================
// THEME STORE
// ============================================================================
// Reactive store that manages the application's color theme.
// Supports 'light', 'dark', and 'system' modes.
//
// FEATURES:
// - Persist theme preference to localStorage
// - React to system theme changes
// - Smooth transitions between themes
//
// USAGE:
// import { theme } from '$stores/theme.svelte';
//
// theme.current = 'dark';  // Switch to dark mode
// theme.toggle();          // Toggle between light/dark
// ============================================================================

// Type declarations for browser globals
declare const globalThis: {
  window?: any;
};

import { isBrowser, getLocalStorage, getWindow } from "$utils/browser";

// Theme type
type Theme = "light" | "dark" | "system";

// Storage key
const STORAGE_KEY = "locanote-theme";

// Get stored theme or default to 'system'
function getStoredTheme(): Theme {
  const storage = getLocalStorage();
  if (!storage) return "system";
  const stored = storage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored as Theme;
  }
  return "system";
}

// Check if system prefers dark mode
function systemPrefersDark(): boolean {
  const win = getWindow();
  if (!win) return false;
  return win.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Theme Store
 * Manages light/dark/system theme with persistence and system reaction.
 */
function createThemeStore() {
  // Reactive state
  let currentTheme = $state<Theme>(getStoredTheme());
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
      // Persist to localStorage
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY, value);
      }
    },
    get isDark(): boolean {
      return isDark;
    },
    toggle() {
      currentTheme = isDark ? "light" : "dark";
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY, currentTheme);
      }
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

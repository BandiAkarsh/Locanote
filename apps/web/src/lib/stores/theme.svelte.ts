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

// Theme type
type Theme = 'light' | 'dark' | 'system';

// Storage key
const STORAGE_KEY = 'locanote-theme';

// Check if running in browser
const isBrowser = typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined';

// Get stored theme or default to 'system'
function getStoredTheme(): Theme {
  if (!isBrowser) return 'system';
  const stored = (globalThis as any).window?.localStorage?.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

// Check if system prefers dark mode
function systemPrefersDark(): boolean {
  if (!isBrowser) return false;
  return (globalThis as any).window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

// Apply theme to document
function applyTheme(theme: Theme) {
  if (!isBrowser) return;
  
  const win = (globalThis as any).window;
  const doc = win?.document;
  if (!doc) return;
  
  const html = doc.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

// Store theme to localStorage
function storeTheme(theme: Theme) {
  if (!isBrowser) return;
  (globalThis as any).window?.localStorage?.setItem(STORAGE_KEY, theme);
}

// Reactive state
let currentTheme = $state<Theme>(getStoredTheme());

// Initialize theme - use $effect to reactively apply theme changes
$effect(() => {
  applyTheme(currentTheme);
});

// Listen for system theme changes
if (isBrowser) {
  const mediaQuery = (globalThis as any).window?.matchMedia?.('(prefers-color-scheme: dark)');
  if (mediaQuery) {
    mediaQuery.addEventListener('change', (e: { matches: boolean }) => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
  }
}

// Computed values
let isDark = $derived(
  currentTheme === 'dark' || (currentTheme === 'system' && systemPrefersDark())
);

// Export theme store
export const theme = {
  get current(): Theme {
    return currentTheme;
  },
  
  set current(value: Theme) {
    currentTheme = value;
    applyTheme(value);
    storeTheme(value);
  },
  
  get isDark(): boolean {
    return isDark;
  },
  
  // Toggle between light and dark (skip system)
  toggle() {
    const newTheme = isDark ? 'light' : 'dark';
    this.current = newTheme;
  },
  
  // Set specific theme
  setLight() {
    this.current = 'light';
  },
  
  setDark() {
    this.current = 'dark';
  },
  
  setSystem() {
    this.current = 'system';
  }
};

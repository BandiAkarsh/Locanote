// ============================================================================
// THEME STORE
// ============================================================================
// Reactive store that manages the application's color theme, accent color,
// and visual style (Glass, Cyberpunk, Inception).
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
export type VisualStyle = "classic" | "glass" | "cyberpunk" | "inception";

// Storage keys
const THEME_KEY = "locanote-theme";
const ACCENT_KEY = "locanote-accent";
const STYLE_KEY = "locanote-style";

// Default values
const DEFAULT_THEME: Theme = "system";
const DEFAULT_ACCENT: AccentColor = "indigo";
const DEFAULT_STYLE: VisualStyle = "classic";

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

function getStoredStyle(): VisualStyle {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_STYLE;
  const stored = storage.getItem(STYLE_KEY);
  const validStyles: VisualStyle[] = [
    "classic",
    "glass",
    "cyberpunk",
    "inception",
  ];
  if (validStyles.includes(stored as VisualStyle)) {
    return stored as VisualStyle;
  }
  return DEFAULT_STYLE;
}

// Check if system prefers dark mode
function systemPrefersDark(): boolean {
  const win = getWindow();
  if (!win) return false;
  return win.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Theme Store
 * Manages light/dark/system theme, accent colors, and visual styles.
 */
function createThemeStore() {
  // Reactive state
  let currentTheme = $state<Theme>(getStoredTheme());
  let currentAccent = $state<AccentColor>(getStoredAccent());
  let currentStyle = $state<VisualStyle>(getStoredStyle());
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
    get style(): VisualStyle {
      return currentStyle;
    },
    set style(value: VisualStyle) {
      currentStyle = value;
      const storage = getLocalStorage();
      if (storage) storage.setItem(STYLE_KEY, value);
    },
    get isDark(): boolean {
      return isDark;
    },
    async toggle(event?: MouseEvent) {
      const win = getWindow();
      
      // Use View Transitions API if supported and event provided
      if (event && win && 'startViewTransition' in win.document) {
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, win.innerWidth - x),
          Math.max(y, win.innerHeight - y)
        );

        // @ts-ignore
        const transition = win.document.startViewTransition(() => {
          currentTheme = isDark ? "light" : "dark";
          const storage = getLocalStorage();
          if (storage) storage.setItem(THEME_KEY, currentTheme);
        });

        await transition.ready;

        win.document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      } else {
        currentTheme = isDark ? "light" : "dark";
        const storage = getLocalStorage();
        if (storage) storage.setItem(THEME_KEY, currentTheme);
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

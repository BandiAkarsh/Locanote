// ============================================================================
// THEME STORE
// ============================================================================
// Reactive store that manages the application's color theme, accent color,
// and visual style.
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
    "indigo", "violet", "rose", "emerald", "amber", "blue", "fuchsia",
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
    /**
     * TOGGLE THEME WITH SYMMETRICAL CIRCULAR REVEAL
     */
    async toggle(event?: MouseEvent) {
      const win = getWindow();
      const doc = win?.document;
      
      // Fallback for non-supporting browsers
      if (!doc || !('startViewTransition' in doc)) {
        currentTheme = isDark ? "light" : "dark";
        const storage = getLocalStorage();
        if (storage) storage.setItem(THEME_KEY, currentTheme);
        return;
      }

      // 1. Get click coordinates
      const x = event?.clientX ?? win.innerWidth / 2;
      const y = event?.clientY ?? win.innerHeight / 2;
      
      // 2. Calculate distance to furthest corner
      const endRadius = Math.hypot(
        Math.max(x, win.innerWidth - x),
        Math.max(y, win.innerHeight - y)
      );

      // 3. Trigger Transition
      // @ts-ignore
      const transition = doc.startViewTransition(async () => {
        currentTheme = isDark ? "light" : "dark";
        const storage = getLocalStorage();
        if (storage) storage.setItem(THEME_KEY, currentTheme);
        
        // Let Svelte update the DOM
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      try {
        await transition.ready;

        // 4. Animate the clip-path on the new root
        doc.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      } catch (e) {
        console.warn('[Theme] Circular reveal failed', e);
      }
    },
    setLight() { this.current = "light"; },
    setDark() { this.current = "dark"; },
    setSystem() { this.current = "system"; },
  };
}

export const theme = createThemeStore();

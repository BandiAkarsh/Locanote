// ============================================================================
// UI STATE STORE (ui.svelte.ts)
// ============================================================================
// Manages global UI preferences including Futuristic Liquid Workspace features.

import { isBrowser } from "$utils/browser";

export type BackgroundStyle = "nebula" | "crystalline" | "aura" | "static";
export type IntentMode = "none" | "recipe" | "task" | "code" | "journal";

export interface UIState {
  cleanMode: boolean; // Simplified UI for non-technical users
  sidebarOpen: boolean;
  fontSize: "small" | "default" | "large";
  backgroundStyle: BackgroundStyle;
  intentMode: IntentMode;
  performanceTier: "low" | "medium" | "high";
}

const DEFAULT_STATE: UIState = {
  cleanMode: false,
  sidebarOpen: true,
  fontSize: "default",
  backgroundStyle: "nebula",
  intentMode: "none",
  performanceTier: "medium",
};

class UIStore {
  #state = $state<UIState>(DEFAULT_STATE);

  constructor() {
    this.initialize();
  }

  /**
   * Load state from localStorage on initialization
   */
  initialize() {
    if (!isBrowser) return;

    try {
      const saved = localStorage.getItem("locanote_ui_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.#state = { ...DEFAULT_STATE, ...parsed };
      }

      // MOBILE OPTIMIZATION: Force static background on small screens
      if (window.innerWidth < 768) {
        console.log(
          "[UIStore] Mobile device detected. Forcing static background.",
        );
        this.#state.backgroundStyle = "static";
      }
    } catch (err) {
      console.warn("[UIStore] Failed to load state:", err);
    }
  }

  /**
   * Persist state to localStorage
   */
  #save() {
    if (!isBrowser) return;
    localStorage.setItem("locanote_ui_state_v2", JSON.stringify(this.#state));
  }

  // Getters
  get cleanMode() {
    return this.#state.cleanMode;
  }
  get sidebarOpen() {
    return this.#state.sidebarOpen;
  }
  get fontSize() {
    return this.#state.fontSize;
  }
  get backgroundStyle() {
    return this.#state.backgroundStyle;
  }
  get intentMode() {
    return this.#state.intentMode;
  }
  get performanceTier() {
    return this.#state.performanceTier;
  }

  // Setters
  set cleanMode(value: boolean) {
    this.#state.cleanMode = value;
    this.#save();
  }

  set sidebarOpen(value: boolean) {
    this.#state.sidebarOpen = value;
    this.#save();
  }

  set fontSize(value: "small" | "default" | "large") {
    this.#state.fontSize = value;
    this.#save();
  }

  set backgroundStyle(value: BackgroundStyle) {
    this.#state.backgroundStyle = value;
    this.#save();
  }

  set intentMode(value: IntentMode) {
    this.#state.intentMode = value;
    // Don't persist intent mode, reset on session
  }

  set performanceTier(value: "low" | "medium" | "high") {
    this.#state.performanceTier = value;
    this.#save();
  }

  /**
   * Reset UI to default settings
   */
  reset() {
    this.#state = { ...DEFAULT_STATE };
    this.#save();
  }
}

export const ui = new UIStore();

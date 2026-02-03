// ============================================================================
// UI STATE STORE (ui.svelte.ts)
// ============================================================================
// Manages global UI preferences like "Clean Mode" and accessibility settings.

import { isBrowser } from "$utils/browser";

export interface UIState {
  cleanMode: boolean; // Simplified UI for non-technical users
  sidebarOpen: boolean;
  fontSize: 'small' | 'default' | 'large';
}

const DEFAULT_STATE: UIState = {
  cleanMode: false,
  sidebarOpen: true,
  fontSize: 'default'
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
      const saved = localStorage.getItem('locanote_ui_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.#state = { ...DEFAULT_STATE, ...parsed };
      }
    } catch (err) {
      console.warn('[UIStore] Failed to load state:', err);
    }
  }

  /**
   * Persist state to localStorage
   */
  #save() {
    if (!isBrowser) return;
    localStorage.setItem('locanote_ui_state', JSON.stringify(this.#state));
  }

  // Getters
  get cleanMode() { return this.#state.cleanMode; }
  get sidebarOpen() { return this.#state.sidebarOpen; }
  get fontSize() { return this.#state.fontSize; }

  // Setters
  set cleanMode(value: boolean) {
    this.#state.cleanMode = value;
    this.#save();
  }

  set sidebarOpen(value: boolean) {
    this.#state.sidebarOpen = value;
    this.#save();
  }

  set fontSize(value: 'small' | 'default' | 'large') {
    this.#state.fontSize = value;
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

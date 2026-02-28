/**
 * AI Module - Main Entry Point
 *
 * On-device AI for Locanote
 * Privacy-first, runs entirely in the browser
 */

// Types
export * from "./types.js";

// Core
export { hardwareDetector, HardwareDetector } from "./hardware.js";
export {
  MODEL_REGISTRY,
  selectModelForTask,
  getModel,
  DEFAULT_MODELS,
} from "./models.js";
export { aiWorker } from "./worker-manager.js";
export { vectorStore, PersistentVectorStore } from "./vector-store.js";

// Stores
export {
  aiState,
  createTagSuggestionsStore,
  createSemanticSearchStore,
  createWritingAssistantStore,
  createSummarizationStore,
  createSmartLinksStore,
} from "./stores.svelte.js";

// Components (types only, actual components need to be imported from .svelte files)
export {
  getConfidenceColor,
  getConfidenceLabel,
  formatConfidenceDots,
} from "./components.js";

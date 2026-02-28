/**
 * Svelte 5 AI Context and Stores
 *
 * Reactive state management for AI features
 */

import type {
  TagSuggestion,
  SearchResult,
  WritingSuggestion,
  SummaryResult,
  RelatedNote,
  AIFeature,
  AIProgress,
  HardwareCapabilities,
} from "./types.js";
import { aiWorker } from "./worker-manager.js";
import { hardwareDetector } from "./hardware.js";

// AI Global State
class AIState {
  // Feature toggles
  autoTagging = $state(true);
  semanticSearch = $state(true);
  summarization = $state(true);
  writingAssistant = $state(true);
  smartLinks = $state(true);

  // System state
  isInitialized = $state(false);
  isLoading = $state(false);
  hardwareCapabilities = $state<HardwareCapabilities | null>(null);
  activeTasks = $state<string[]>([]);
  modelCacheSize = $state(0); // MB

  // Progress tracking
  progress = $state<AIProgress | null>(null);

  constructor() {
    // Detect hardware on mount
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.isLoading = true;

    try {
      // Detect hardware
      this.hardwareCapabilities = await hardwareDetector.detect();

      // Initialize worker
      await aiWorker.initialize();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize AI:", error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleFeature(feature: AIFeature): void {
    const current = this.isFeatureEnabled(feature);
    this.setFeatureEnabled(feature, !current);
  }

  setFeatureEnabled(feature: AIFeature, enabled: boolean): void {
    aiWorker.setFeatureEnabled(feature, enabled);

    switch (feature) {
      case "auto-tagging":
        this.autoTagging = enabled;
        break;
      case "semantic-search":
        this.semanticSearch = enabled;
        break;
      case "summarization":
        this.summarization = enabled;
        break;
      case "writing-assistant":
        this.writingAssistant = enabled;
        break;
      case "smart-links":
        this.smartLinks = enabled;
        break;
    }
  }

  isFeatureEnabled(feature: AIFeature): boolean {
    switch (feature) {
      case "auto-tagging":
        return this.autoTagging;
      case "semantic-search":
        return this.semanticSearch;
      case "summarization":
        return this.summarization;
      case "writing-assistant":
        return this.writingAssistant;
      case "smart-links":
        return this.smartLinks;
      default:
        return false;
    }
  }

  get canRunAI(): boolean {
    return this.isInitialized && this.hardwareCapabilities !== null;
  }

  get deviceTier(): "high" | "medium" | "low" | "unknown" {
    return this.hardwareCapabilities?.deviceTier || "unknown";
  }

  get hasGPU(): boolean {
    return this.hardwareCapabilities?.webgpu || false;
  }

  get batteryStatus(): { level: number; charging: boolean } | null {
    if (!this.hardwareCapabilities) return null;
    return {
      level: this.hardwareCapabilities.batteryLevel,
      charging: !this.hardwareCapabilities.isBatteryPowered,
    };
  }
}

// Global singleton
export const aiState = new AIState();

// Feature-specific stores

// Auto-tagging suggestions
export function createTagSuggestionsStore() {
  let suggestions = $state<TagSuggestion[]>([]);
  let isLoading = $state(false);

  async function generateSuggestions(content: string, existingTags: string[]) {
    if (!aiState.autoTagging || !content.trim()) {
      suggestions = [];
      return;
    }

    isLoading = true;
    try {
      const result = await aiWorker.executeTask({
        type: "tag-suggestion",
        input: { content, existingTags },
        priority: "normal",
      });

      if (result.success) {
        suggestions = result.data as TagSuggestion[];
      }
    } finally {
      isLoading = false;
    }
  }

  function acceptSuggestion(tag: string) {
    suggestions = suggestions.filter((s) => s.tag !== tag);
  }

  function dismissSuggestion(tag: string) {
    suggestions = suggestions.filter((s) => s.tag !== tag);
  }

  return {
    get suggestions() {
      return suggestions;
    },
    get isLoading() {
      return isLoading;
    },
    generateSuggestions,
    acceptSuggestion,
    dismissSuggestion,
  };
}

// Semantic search
export function createSemanticSearchStore() {
  let results = $state<SearchResult[]>([]);
  let isSearching = $state(false);
  let query = $state("");

  async function search(searchQuery: string) {
    if (!aiState.semanticSearch || !searchQuery.trim()) {
      results = [];
      return;
    }

    query = searchQuery;
    isSearching = true;

    try {
      // In real implementation, query vector DB
      // For now, return empty results
      results = [];
    } finally {
      isSearching = false;
    }
  }

  function clearResults() {
    results = [];
    query = "";
  }

  return {
    get results() {
      return results;
    },
    get isSearching() {
      return isSearching;
    },
    get query() {
      return query;
    },
    search,
    clearResults,
  };
}

// Writing assistant
export function createWritingAssistantStore() {
  let suggestions = $state<WritingSuggestion[]>([]);
  let isAnalyzing = $state(false);
  let ghostText = $state<string | null>(null);

  async function analyzeText(text: string, cursorPosition: number) {
    if (!aiState.writingAssistant || !text.trim()) {
      suggestions = [];
      ghostText = null;
      return;
    }

    isAnalyzing = true;
    try {
      // Request completion
      const result = await aiWorker.executeTask({
        type: "completion",
        input: { text, cursor: cursorPosition },
        priority: "high",
      });

      if (result.success) {
        ghostText = (result.data as { text: string }).text;
      }
    } finally {
      isAnalyzing = false;
    }
  }

  function acceptSuggestion(suggestion: WritingSuggestion) {
    suggestions = suggestions.filter((s) => s !== suggestion);
  }

  function dismissGhostText() {
    ghostText = null;
  }

  return {
    get suggestions() {
      return suggestions;
    },
    get isAnalyzing() {
      return isAnalyzing;
    },
    get ghostText() {
      return ghostText;
    },
    analyzeText,
    acceptSuggestion,
    dismissGhostText,
  };
}

// Note summarization
export function createSummarizationStore() {
  let summary = $state<SummaryResult | null>(null);
  let isGenerating = $state(false);

  async function generateSummary(
    content: string,
    style: "concise" | "detailed" | "bullet-points" = "concise",
  ) {
    if (!aiState.summarization || !content.trim()) {
      summary = null;
      return;
    }

    isGenerating = true;
    try {
      const result = await aiWorker.executeTask({
        type: "summarize",
        input: { content, style },
        priority: "normal",
      });

      if (result.success) {
        summary = result.data as SummaryResult;
      }
    } finally {
      isGenerating = false;
    }
  }

  function clearSummary() {
    summary = null;
  }

  return {
    get summary() {
      return summary;
    },
    get isGenerating() {
      return isGenerating;
    },
    generateSummary,
    clearSummary,
  };
}

// Smart links
export function createSmartLinksStore() {
  let relatedNotes = $state<RelatedNote[]>([]);
  let isFinding = $state(false);

  async function findRelatedNotes(noteId: string) {
    if (!aiState.smartLinks) {
      relatedNotes = [];
      return;
    }

    isFinding = true;
    try {
      // Query vector DB for similar notes
      relatedNotes = [];
    } finally {
      isFinding = false;
    }
  }

  return {
    get relatedNotes() {
      return relatedNotes;
    },
    get isFinding() {
      return isFinding;
    },
    findRelatedNotes,
  };
}

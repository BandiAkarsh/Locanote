// ============================================================================
// PRIVACY SETTINGS STORE
// ============================================================================
// Svelte 5 runes-based store for managing privacy configuration.
// Provides reactive privacy settings with persistence and validation.
//
// COMPLIANCE: GDPR Article 25 (Data Protection by Design)
// ============================================================================

import type {
  PrivacyConfig,
  PrivacyLevel,
  ConsentRecord,
  ConsentPurpose,
  PrivacyScore,
} from "./types";
import {
  getDefaultPrivacyConfig,
  MAXIMUM_PRIVACY,
  BALANCED_PRIVACY,
  MINIMAL_PRIVACY,
} from "./types";

// ============================================================================
// SVELTE 5 TYPE DECLARATIONS
// ============================================================================

declare const $state: <T>(initial: T) => T;
declare const $effect: (fn: () => void | (() => void)) => void;
declare const $derived: <T>(fn: () => T) => T;

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "locanote_privacy_config";
const CONSENT_KEY = "locanote_consent_records";
const SCORE_CACHE_KEY = "locanote_privacy_score";

// ============================================================================
// PRIVACY STORE
// ============================================================================

function createPrivacyStore() {
  // ========================================================================
  // STATE
  // ========================================================================

  // Current privacy configuration
  let config = $state<PrivacyConfig>(getDefaultPrivacyConfig("balanced"));

  // Consent records
  let consents = $state<Record<ConsentPurpose, ConsentRecord>>({
    analytics: createDefaultConsent("analytics"),
    crash_reports: createDefaultConsent("crash_reports"),
    performance_metrics: createDefaultConsent("performance_metrics"),
    p2p_collaboration: createDefaultConsent("p2p_collaboration"),
    cloud_backup: createDefaultConsent("cloud_backup"),
  });

  // Privacy score (calculated on demand, cached)
  let cachedScore = $state<PrivacyScore | null>(null);

  // Loading state
  let isLoading = $state(true);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  function initialize() {
    if (typeof window === "undefined") return;

    try {
      // Load privacy config
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        config = {
          ...getDefaultPrivacyConfig(parsed.level || "balanced"),
          ...parsed,
        };
      }

      // Load consent records
      const savedConsents = localStorage.getItem(CONSENT_KEY);
      if (savedConsents) {
        consents = { ...consents, ...JSON.parse(savedConsents) };
      }

      // Load cached score
      const cached = localStorage.getItem(SCORE_CACHE_KEY);
      if (cached) {
        cachedScore = JSON.parse(cached);
      }
    } catch (e) {
      console.error("[Privacy] Failed to load privacy settings:", e);
      // Reset to defaults on error
      config = getDefaultPrivacyConfig("balanced");
    } finally {
      isLoading = false;
    }
  }

  // Persist changes to localStorage
  $effect(() => {
    if (typeof window === "undefined" || isLoading) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("[Privacy] Failed to save privacy settings:", e);
    }
  });

  // Persist consent changes
  $effect(() => {
    if (typeof window === "undefined" || isLoading) return;

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consents));
    } catch (e) {
      console.error("[Privacy] Failed to save consent records:", e);
    }
  });

  // ========================================================================
  // CONFIGURATION METHODS
  // ========================================================================

  /**
   * Set privacy level to a preset.
   */
  function setPrivacyLevel(level: PrivacyLevel) {
    config = getDefaultPrivacyConfig(level);
    invalidateScore();
  }

  /**
   * Update specific config field.
   */
  function updateConfig(updates: Partial<PrivacyConfig>) {
    config = { ...config, ...updates, level: "custom" };
    invalidateScore();
  }

  /**
   * Get current config.
   */
  function getConfig(): PrivacyConfig {
    return { ...config };
  }

  /**
   * Reset to defaults.
   */
  function resetToDefaults() {
    config = getDefaultPrivacyConfig("balanced");
    invalidateScore();
  }

  // ========================================================================
  // CONSENT MANAGEMENT
  // ========================================================================

  /**
   * Grant consent for a specific purpose.
   */
  function grantConsent(purpose: ConsentPurpose, durationDays?: number) {
    const now = new Date();
    consents = {
      ...consents,
      [purpose]: {
        id: `consent-${purpose}-${now.getTime()}`,
        purpose,
        granted: true,
        grantedAt: now,
        expiresAt: durationDays
          ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
          : undefined,
        version: "2026.1",
      },
    };
  }

  /**
   * Revoke consent for a specific purpose.
   */
  function revokeConsent(purpose: ConsentPurpose) {
    consents = {
      ...consents,
      [purpose]: {
        ...consents[purpose],
        granted: false,
        revokedAt: new Date(),
      },
    };
  }

  /**
   * Check if consent is granted for a purpose.
   */
  function hasConsent(purpose: ConsentPurpose): boolean {
    const record = consents[purpose];
    if (!record.granted) return false;
    if (record.expiresAt && new Date() > record.expiresAt) return false;
    return true;
  }

  /**
   * Get all consent records.
   */
  function getAllConsents(): ConsentRecord[] {
    return Object.values(consents);
  }

  // ========================================================================
  // PRIVACY SCORE
  // ========================================================================

  /**
   * Calculate privacy health score.
   */
  function calculatePrivacyScore(): PrivacyScore {
    // Use cached score if available and recent
    if (cachedScore) {
      const age = Date.now() - cachedScore.calculatedAt.getTime();
      if (age < 5 * 60 * 1000) return cachedScore; // Cache for 5 minutes
    }

    const score: PrivacyScore = {
      overall: 0,
      encryption: calculateEncryptionScore(),
      minimization: calculateMinimizationScore(),
      control: calculateControlScore(),
      transparency: calculateTransparencyScore(),
      compliance: calculateComplianceScore(),
      calculatedAt: new Date(),
      recommendations: generateRecommendations(),
    };

    // Overall is weighted average
    score.overall = Math.round(
      score.encryption * 0.25 +
        score.minimization * 0.25 +
        score.control * 0.2 +
        score.transparency * 0.15 +
        score.compliance * 0.15,
    );

    cachedScore = score;

    // Cache to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(SCORE_CACHE_KEY, JSON.stringify(score));
    }

    return score;
  }

  /**
   * Invalidate cached score.
   */
  function invalidateScore() {
    cachedScore = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(SCORE_CACHE_KEY);
    }
  }

  // ========================================================================
  // SCORE CALCULATION HELPERS
  // ========================================================================

  function calculateEncryptionScore(): number {
    let score = 0;
    if (config.encryptLocalStorage) score += 40;
    if (config.encryptExports) score += 20;
    if (config.requirePasswordForSharing) score += 20;
    if (config.anonymousPeerIds) score += 20;
    return score;
  }

  function calculateMinimizationScore(): number {
    let score = 0;
    if (!config.allowAnalytics) score += 25;
    if (!config.allowCrashReports) score += 25;
    if (config.deletedNoteRetention === 0) score += 25;
    if (config.editHistoryRetention === 0) score += 25;
    return score;
  }

  function calculateControlScore(): number {
    let score = 0;
    if (config.level === "custom") score += 30;
    if (config.autoLockTimeout > 0) score += 35;
    if (config.deletionMethod === "crypto-shred") score += 35;
    return score;
  }

  function calculateTransparencyScore(): number {
    // Based on audit log and consent management
    const consentCount = Object.values(consents).filter(
      (c) => c.granted,
    ).length;
    return Math.min(100, 20 + consentCount * 15);
  }

  function calculateComplianceScore(): number {
    let score = 0;
    // GDPR Art 25
    if (config.encryptLocalStorage) score += 20;
    if (config.ephemeralSignaling) score += 20;
    // CCPA
    if (config.exportIncludeMetadata) score += 20;
    if (config.deletionMethod !== "standard") score += 20;
    // Data minimization
    if (!config.allowAnalytics) score += 20;
    return score;
  }

  function generateRecommendations(): string[] {
    const recs: string[] = [];

    if (!config.encryptExports) {
      recs.push(
        "Enable export encryption for better data portability security",
      );
    }
    if (config.autoLockTimeout === 0) {
      recs.push("Set an auto-lock timeout to protect your data when away");
    }
    if (config.deletionMethod === "standard") {
      recs.push("Switch to crypto-shredding for secure deletion");
    }
    if (!config.anonymousPeerIds) {
      recs.push("Enable anonymous peer IDs for better P2P privacy");
    }
    if (config.allowAnalytics) {
      recs.push("Consider disabling analytics for maximum privacy");
    }
    if (config.deletedNoteRetention > 30) {
      recs.push("Reduce deleted note retention period");
    }

    return recs;
  }

  // ========================================================================
  // DERIVED VALUES
  // ========================================================================
  // Note: Using getters instead of $derived for compatibility

  function getCurrentLevel(): PrivacyLevel {
    return config.level;
  }

  function getIsMaximumPrivacy(): boolean {
    return (
      config.level === "maximum" ||
      (config.encryptLocalStorage &&
        !config.allowAnalytics &&
        config.deletionMethod === "crypto-shred")
    );
  }

  function getCanShareAnonymously(): boolean {
    return config.anonymousPeerIds;
  }

  function getRequiresPassword(): boolean {
    return config.requirePasswordForSharing;
  }

  // ========================================================================
  // RETURN STORE INTERFACE
  // ========================================================================

  return {
    // State (reactive)
    get config() {
      return config;
    },
    get consents() {
      return consents;
    },
    get isLoading() {
      return isLoading;
    },

    // Derived values (using getters for reactivity)
    get currentLevel() {
      return getCurrentLevel();
    },
    get isMaximumPrivacy() {
      return getIsMaximumPrivacy();
    },
    get canShareAnonymously() {
      return getCanShareAnonymously();
    },
    get requiresPassword() {
      return getRequiresPassword();
    },

    // Methods
    initialize,
    setPrivacyLevel,
    updateConfig,
    getConfig,
    resetToDefaults,
    grantConsent,
    revokeConsent,
    hasConsent,
    getAllConsents,
    calculatePrivacyScore,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createDefaultConsent(purpose: ConsentPurpose): ConsentRecord {
  return {
    id: `consent-${purpose}-default`,
    purpose,
    granted: false,
    version: "2026.1",
  };
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const privacyStore = createPrivacyStore();

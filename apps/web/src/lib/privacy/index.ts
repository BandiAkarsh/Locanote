// ============================================================================
// PRIVACY MODULE - PUBLIC API
// ============================================================================
// Export all privacy-related functionality from a single entry point.
//
// USAGE:
//   import { privacyStore, getGDPRComplianceService } from '$privacy';
//
// COMPLIANCE:
// - GDPR Article 25: Data Protection by Design
// - CCPA: California Consumer Privacy Act
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Privacy Configuration
  PrivacyLevel,
  PrivacyConfig,
  // Data Minimization
  DataClassification,
  DataField,
  // GDPR
  GDPRRight,
  GDPRRequest,
  UserDataExport,
  // Differential Privacy
  DPConfig,
  DPQueryResult,
  // Audit & Consent
  PrivacyEventType,
  PrivacyAuditEntry,
  ConsentRecord,
  ConsentPurpose,
  // Privacy Score
  PrivacyScore,
  // Deletion
  DeletionMethod,
  SecureDeletionOptions,
  DeletionResult,
  // P2P
  AnonymousPeerConfig,
} from "./types";

// PII Detection types
export type { PIIDetected, PIIScanResult } from "./data-minimization";

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export {
  MAXIMUM_PRIVACY,
  BALANCED_PRIVACY,
  MINIMAL_PRIVACY,
  getDefaultPrivacyConfig,
  DATA_REGISTRY,
  DEFAULT_DP_CONFIG,
} from "./types";

// ============================================================================
// PRIVACY SETTINGS STORE
// ============================================================================

export { privacyStore } from "./settings.svelte";

// ============================================================================
// DATA MINIMIZATION
// ============================================================================

export {
  DataMinimizationService,
  getDataMinimizationService,
  resetDataMinimizationService,
  containsPII,
  validateDataFields,
  getDataFieldStats,
} from "./data-minimization";

// ============================================================================
// CRYPTO SHREDDING
// ============================================================================

export {
  CryptoShreddingService,
  getCryptoShreddingService,
  resetCryptoShreddingService,
  secureDeleteFromIndexedDB,
} from "./crypto-shredding";

// ============================================================================
// DIFFERENTIAL PRIVACY
// ============================================================================

export {
  DifferentialPrivacyService,
  getDifferentialPrivacyService,
  resetDifferentialPrivacyService,
  collectPrivateEvent,
} from "./differential-privacy";

// ============================================================================
// GDPR COMPLIANCE
// ============================================================================

export {
  GDPRComplianceService,
  getGDPRComplianceService,
  resetGDPRComplianceService,
  GDPR_ARTICLE_25_CHECKLIST,
  checkGDPRCompliance,
} from "./gdpr";

// ============================================================================
// CCPA COMPLIANCE
// ============================================================================

export {
  CCPAComplianceService,
  getCCPAComplianceService,
  resetCCPAComplianceService,
  CCPA_CHECKLIST,
  checkCCPACompliance,
} from "./ccpa";

// ============================================================================
// ANONYMOUS SIGNALING
// ============================================================================

export {
  EphemeralIdManager,
  MetadataMinimizer,
  AnonymousSignalingService,
  getAnonymousSignalingService,
  resetAnonymousSignalingService,
  createOnionMessage,
} from "./anonymous-signaling";

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

import type { PrivacyAuditEntry, PrivacyEventType } from "./types";

/**
 * Privacy audit log service.
 * Records privacy-related events locally (never transmitted).
 */
class AuditLogService {
  private logs: PrivacyAuditEntry[] = [];
  private maxEntries: number = 1000;

  /**
   * Record a privacy event.
   */
  log(
    type: PrivacyEventType,
    userId: string,
    action: string,
    resourceId?: string,
    details?: Record<string, unknown>,
  ): void {
    const entry: PrivacyAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      userId,
      resourceId,
      action,
      details,
    };

    this.logs.push(entry);

    // Trim if exceeding max
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }

    // Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "locanote_privacy_audit",
          JSON.stringify(this.logs),
        );
      } catch (e) {
        // Storage might be full - continue without persisting
      }
    }
  }

  /**
   * Get audit log entries.
   */
  getLogs(filter?: {
    type?: PrivacyEventType;
    userId?: string;
    resourceId?: string;
    since?: Date;
  }): PrivacyAuditEntry[] {
    let filtered = [...this.logs];

    if (filter?.type) {
      filtered = filtered.filter((l) => l.type === filter.type);
    }
    if (filter?.userId) {
      filtered = filtered.filter((l) => l.userId === filter.userId);
    }
    if (filter?.resourceId) {
      filtered = filtered.filter((l) => l.resourceId === filter.resourceId);
    }
    if (filter?.since) {
      filtered = filtered.filter((l) => l.timestamp >= filter.since!.getTime());
    }

    return filtered;
  }

  /**
   * Clear all audit logs.
   */
  clear(): void {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem("locanote_privacy_audit");
    }
  }

  /**
   * Export audit log (for GDPR compliance).
   */
  export(userId: string): PrivacyAuditEntry[] {
    return this.getLogs({ userId });
  }

  /**
   * Load from storage.
   */
  load(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("locanote_privacy_audit");
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error("[AuditLog] Failed to load:", e);
    }
  }
}

// Export singleton
export const auditLog = new AuditLogService();

// ============================================================================
// PRIVACY UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize all privacy services.
 * Call this on app startup.
 */
export function initializePrivacyServices(): void {
  // Load audit log
  auditLog.load();

  // Initialize privacy store
  const { privacyStore } = require("./settings.svelte");
  privacyStore.initialize();

  console.log("[Privacy] Services initialized");
}

/**
 * Check overall privacy compliance.
 */
export function checkPrivacyCompliance(): {
  gdpr: { compliant: boolean; score: number };
  ccpa: { compliant: boolean; score: number };
  overall: { compliant: boolean; score: number };
} {
  const { checkGDPRCompliance } = require("./gdpr");
  const { checkCCPACompliance } = require("./ccpa");

  const gdpr = checkGDPRCompliance();
  const ccpa = checkCCPACompliance();

  return {
    gdpr: { compliant: gdpr.compliant, score: gdpr.score },
    ccpa: { compliant: ccpa.compliant, score: ccpa.score },
    overall: {
      compliant: gdpr.compliant && ccpa.compliant,
      score: Math.round((gdpr.score + ccpa.score) / 2),
    },
  };
}

/**
 * Check overall privacy compliance (deprecated, use checkPrivacyCompliance).
 * @deprecated
 */
export function checkOverallCompliance(): ReturnType<
  typeof checkPrivacyCompliance
> {
  return checkPrivacyCompliance();
}

/**
 * Generate comprehensive privacy report.
 */
export function generatePrivacyReport(): {
  score: number;
  compliance: ReturnType<typeof checkPrivacyCompliance>;
  config: import("./types").PrivacyConfig;
  dataFields: ReturnType<typeof getDataFieldStats>;
  recommendations: string[];
} {
  const { privacyStore } = require("./settings.svelte");
  const { getDataFieldStats } = require("./data-minimization");

  const compliance = checkPrivacyCompliance();
  const config = privacyStore.getConfig();
  const dataFields = getDataFieldStats();
  const score = privacyStore.calculatePrivacyScore();

  return {
    score: score.overall,
    compliance,
    config,
    dataFields,
    recommendations: score.recommendations,
  };
}

// ============================================================================
// VERSION
// ============================================================================

export const PRIVACY_MODULE_VERSION = "2026.1";

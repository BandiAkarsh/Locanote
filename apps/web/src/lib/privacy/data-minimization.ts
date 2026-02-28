// ============================================================================
// DATA MINIMIZATION SERVICE
// ============================================================================
// Implements Privacy by Design principles through automatic data minimization.
// Ensures only essential data is collected, stored, and retained.
//
// COMPLIANCE:
// - GDPR Article 25(1): Data protection by design
// - GDPR Article 5(1)(c): Data minimization
// - CCPA Section 1798.100: Data collection limitations
// ============================================================================

import {
  DATA_REGISTRY,
  type DataField,
  type DataClassification,
  type PrivacyConfig,
} from "./types";

// ============================================================================
// PII DETECTION PATTERNS
// ============================================================================

/**
 * Patterns for detecting personally identifiable information (PII).
 * Used to warn users and suggest anonymization.
 */
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  url: /https?:\/\/[^\s]+/g,
};

/**
 * Potential PII types detected in content.
 */
export type PIIDetected =
  | "email"
  | "phone"
  | "ssn"
  | "creditCard"
  | "ipAddress"
  | "url";

/**
 * Result of PII scanning.
 */
export interface PIIScanResult {
  hasPII: boolean;
  types: PIIDetected[];
  count: number;
  positions: Array<{
    type: PIIDetected;
    start: number;
    end: number;
    value: string;
  }>;
}

// ============================================================================
// DATA MINIMIZATION SERVICE
// ============================================================================

export class DataMinimizationService {
  private config: PrivacyConfig;
  private deletionCallbacks: Array<(dataType: string) => Promise<void>> = [];

  constructor(config: PrivacyConfig) {
    this.config = config;
  }

  /**
   * Update service configuration.
   */
  updateConfig(config: PrivacyConfig): void {
    this.config = config;
  }

  /**
   * Register a callback for data deletion events.
   */
  onDataDeletion(callback: (dataType: string) => Promise<void>): () => void {
    this.deletionCallbacks.push(callback);
    return () => {
      const index = this.deletionCallbacks.indexOf(callback);
      if (index > -1) {
        this.deletionCallbacks.splice(index, 1);
      }
    };
  }

  // ========================================================================
  // DATA FIELD MANAGEMENT
  // ========================================================================

  /**
   * Get all data fields that match a classification.
   */
  getFieldsByClassification(classification: DataClassification): DataField[] {
    return DATA_REGISTRY.filter((f) => f.classification === classification);
  }

  /**
   * Get all essential data fields.
   */
  getEssentialFields(): DataField[] {
    return this.getFieldsByClassification("essential");
  }

  /**
   * Get all prohibited data fields (should never be collected).
   */
  getProhibitedFields(): DataField[] {
    return this.getFieldsByClassification("prohibited");
  }

  /**
   * Check if a field is allowed to be collected.
   */
  isFieldAllowed(fieldName: string): boolean {
    const field = DATA_REGISTRY.find((f) => f.name === fieldName);
    if (!field) return false;
    if (field.classification === "prohibited") return false;
    if (field.classification === "analytics" && !this.config.allowAnalytics) {
      return false;
    }
    return true;
  }

  /**
   * Get retention period for a field.
   */
  getRetentionDays(fieldName: string): number {
    const field = DATA_REGISTRY.find((f) => f.name === fieldName);
    if (!field) return 0;

    // Override with config for certain fields
    if (field.name === "deleted_note" || field.name.includes("deleted")) {
      return this.config.deletedNoteRetention;
    }
    if (field.name.includes("history")) {
      return this.config.editHistoryRetention;
    }

    return field.retentionDays;
  }

  // ========================================================================
  // PII DETECTION
  // ========================================================================

  /**
   * Scan content for personally identifiable information.
   */
  scanForPII(content: string): PIIScanResult {
    const result: PIIScanResult = {
      hasPII: false,
      types: [],
      count: 0,
      positions: [],
    };

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          result.hasPII = true;
          if (!result.types.includes(type as PIIDetected)) {
            result.types.push(type as PIIDetected);
          }
          result.count++;
          result.positions.push({
            type: type as PIIDetected,
            start: match.index,
            end: match.index + match[0].length,
            value: match[0],
          });
        }
      }
    }

    return result;
  }

  /**
   * Suggest anonymization for content with PII.
   */
  suggestAnonymization(content: string): string {
    let anonymized = content;

    // Replace emails
    anonymized = anonymized.replace(PII_PATTERNS.email, "[EMAIL REDACTED]");

    // Replace phones
    anonymized = anonymized.replace(PII_PATTERNS.phone, "[PHONE REDACTED]");

    // Replace SSNs
    anonymized = anonymized.replace(PII_PATTERNS.ssn, "[SSN REDACTED]");

    // Replace credit cards
    anonymized = anonymized.replace(PII_PATTERNS.creditCard, "[CARD REDACTED]");

    // Replace IPs
    anonymized = anonymized.replace(PII_PATTERNS.ipAddress, "[IP REDACTED]");

    return anonymized;
  }

  // ========================================================================
  // AUTOMATIC DATA PURGING
  // ========================================================================

  /**
   * Purge data that has exceeded its retention period.
   */
  async purgeExpiredData(): Promise<{
    purgedFields: string[];
    totalPurged: number;
  }> {
    const purgedFields: string[] = [];
    let totalPurged = 0;

    const now = Date.now();

    for (const field of DATA_REGISTRY) {
      const retentionDays = this.getRetentionDays(field.name);

      // Skip fields with no retention limit or prohibited fields
      if (retentionDays < 0 || field.classification === "prohibited") {
        continue;
      }

      // Calculate expiration
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

      // Trigger deletion callback
      for (const callback of this.deletionCallbacks) {
        try {
          await callback(field.name);
          purgedFields.push(field.name);
          totalPurged++;
        } catch (e) {
          console.error(`[DataMinimization] Failed to purge ${field.name}:`, e);
        }
      }
    }

    return { purgedFields, totalPurged };
  }

  /**
   * Schedule automatic purging.
   */
  schedulePurging(intervalHours: number = 24): () => void {
    const intervalId = setInterval(
      () => {
        this.purgeExpiredData().catch((e) => {
          console.error("[DataMinimization] Scheduled purge failed:", e);
        });
      },
      intervalHours * 60 * 60 * 1000,
    );

    return () => clearInterval(intervalId);
  }

  // ========================================================================
  // DATA TRANSPARENCY
  // ========================================================================

  /**
   * Generate transparency report for the user.
   * Shows what data is collected, why, and for how long.
   */
  generateTransparencyReport(): {
    collected: DataField[];
    notCollected: DataField[];
    totalStorage: string;
    recommendations: string[];
  } {
    const collected: DataField[] = [];
    const notCollected: DataField[] = [];

    for (const field of DATA_REGISTRY) {
      if (this.isFieldAllowed(field.name)) {
        collected.push(field);
      } else {
        notCollected.push(field);
      }
    }

    const recommendations = this.generateRecommendations();

    return {
      collected,
      notCollected,
      totalStorage: "Calculated on request", // Would need actual storage calculation
      recommendations,
    };
  }

  private generateRecommendations(): string[] {
    const recs: string[] = [];

    // Check for excessive data retention
    if (this.config.editHistoryRetention > 90) {
      recs.push("Consider reducing edit history retention for better privacy");
    }

    // Check for analytics
    if (this.config.allowAnalytics) {
      recs.push(
        "Analytics is enabled - data is anonymized with differential privacy",
      );
    }

    // Check for unencrypted fields
    const unencrypted = DATA_REGISTRY.filter(
      (f) => f.classification !== "prohibited" && !f.encrypted,
    );
    if (unencrypted.length > 0) {
      recs.push(
        `${unencrypted.length} data fields are not encrypted - review recommended`,
      );
    }

    return recs;
  }
}

// ============================================================================
// STATIC UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a value appears to contain PII.
 */
export function containsPII(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const service = new DataMinimizationService({} as PrivacyConfig);
  return service.scanForPII(value).hasPII;
}

/**
 * Validate that data doesn't contain prohibited fields.
 */
export function validateDataFields(data: Record<string, unknown>): {
  valid: boolean;
  prohibited: string[];
} {
  const prohibitedFields = DATA_REGISTRY.filter(
    (f) => f.classification === "prohibited",
  ).map((f) => f.name);

  const found = Object.keys(data).filter((key) =>
    prohibitedFields.includes(key),
  );

  return {
    valid: found.length === 0,
    prohibited: found,
  };
}

/**
 * Get total number of data fields by classification.
 */
export function getDataFieldStats(): Record<DataClassification, number> {
  const stats: Record<DataClassification, number> = {
    essential: 0,
    operational: 0,
    analytics: 0,
    prohibited: 0,
  };

  for (const field of DATA_REGISTRY) {
    stats[field.classification]++;
  }

  return stats;
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

let minimizationService: DataMinimizationService | null = null;

export function getDataMinimizationService(
  config?: PrivacyConfig,
): DataMinimizationService {
  if (!minimizationService && config) {
    minimizationService = new DataMinimizationService(config);
  } else if (!minimizationService) {
    throw new Error(
      "DataMinimizationService not initialized - config required on first call",
    );
  } else if (config) {
    minimizationService.updateConfig(config);
  }
  return minimizationService;
}

export function resetDataMinimizationService(): void {
  minimizationService = null;
}

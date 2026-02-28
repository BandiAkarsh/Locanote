// ============================================================================
// PRIVACY TYPES
// ============================================================================
// Core type definitions for privacy-preserving features.
// These types support GDPR compliance, data minimization, and user controls.
//
// COMPLIANCE: GDPR Article 25, CCPA Section 1798.100
// ============================================================================

// ============================================================================
// PRIVACY LEVELS
// ============================================================================

/**
 * Privacy preset levels for simplified user selection.
 * Maps to specific technical configurations.
 */
export type PrivacyLevel = "minimal" | "balanced" | "maximum" | "custom";

/**
 * Detailed privacy configuration.
 * Each field represents a specific privacy control.
 */
export interface PrivacyConfig {
  /** Overall privacy level preset */
  level: PrivacyLevel;

  // Data Collection
  /** Allow anonymous usage analytics */
  allowAnalytics: boolean;
  /** Allow crash reporting */
  allowCrashReports: boolean;
  /** Allow performance metrics */
  allowPerformanceMetrics: boolean;

  // Storage
  /** Encrypt all local data */
  encryptLocalStorage: boolean;
  /** Auto-lock after inactivity (minutes, 0 = never) */
  autoLockTimeout: number;
  /** Secure deletion method */
  deletionMethod: "standard" | "crypto-shred" | "overwrite";

  // P2P/Collaboration
  /** Use anonymous peer IDs */
  anonymousPeerIds: boolean;
  /** Ephemeral signaling (no logs) */
  ephemeralSignaling: boolean;
  /** Require password for shared notes */
  requirePasswordForSharing: boolean;

  // Export/Portability
  /** Include metadata in exports */
  exportIncludeMetadata: boolean;
  /** Encrypt exported files */
  encryptExports: boolean;

  // Retention
  /** Days to keep deleted notes (0 = immediate) */
  deletedNoteRetention: number;
  /** Days to keep edit history (0 = none) */
  editHistoryRetention: number;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Maximum privacy - collects minimal data, maximum security.
 * Recommended for: journalists, activists, high-security users
 */
export const MAXIMUM_PRIVACY: PrivacyConfig = {
  level: "maximum",
  allowAnalytics: false,
  allowCrashReports: false,
  allowPerformanceMetrics: false,
  encryptLocalStorage: true,
  autoLockTimeout: 5,
  deletionMethod: "crypto-shred",
  anonymousPeerIds: true,
  ephemeralSignaling: true,
  requirePasswordForSharing: true,
  exportIncludeMetadata: false,
  encryptExports: true,
  deletedNoteRetention: 0,
  editHistoryRetention: 0,
};

/**
 * Balanced privacy - reasonable privacy with some convenience features.
 * Recommended for: general users
 */
export const BALANCED_PRIVACY: PrivacyConfig = {
  level: "balanced",
  allowAnalytics: true, // Differential privacy only
  allowCrashReports: true,
  allowPerformanceMetrics: true,
  encryptLocalStorage: true,
  autoLockTimeout: 30,
  deletionMethod: "crypto-shred",
  anonymousPeerIds: true,
  ephemeralSignaling: true,
  requirePasswordForSharing: false,
  exportIncludeMetadata: true,
  encryptExports: false,
  deletedNoteRetention: 30,
  editHistoryRetention: 90,
};

/**
 * Minimal privacy - maximum convenience, basic privacy protections.
 * NOT RECOMMENDED for sensitive data.
 */
export const MINIMAL_PRIVACY: PrivacyConfig = {
  level: "minimal",
  allowAnalytics: true,
  allowCrashReports: true,
  allowPerformanceMetrics: true,
  encryptLocalStorage: true, // Always on for security
  autoLockTimeout: 0, // Never
  deletionMethod: "standard",
  anonymousPeerIds: false,
  ephemeralSignaling: false,
  requirePasswordForSharing: false,
  exportIncludeMetadata: true,
  encryptExports: false,
  deletedNoteRetention: 90,
  editHistoryRetention: 365,
};

/**
 * Get default config for a privacy level.
 */
export function getDefaultPrivacyConfig(level: PrivacyLevel): PrivacyConfig {
  switch (level) {
    case "maximum":
      return { ...MAXIMUM_PRIVACY };
    case "minimal":
      return { ...MINIMAL_PRIVACY };
    case "balanced":
    default:
      return { ...BALANCED_PRIVACY };
  }
}

// ============================================================================
// DATA MINIMIZATION
// ============================================================================

/**
 * Classification of data fields by sensitivity.
 */
export type DataClassification =
  | "essential" // Required for core functionality
  | "operational" // Improves experience but not required
  | "analytics" // Usage data (anonymized)
  | "prohibited"; // Never collected

/**
 * Metadata about a data field.
 */
export interface DataField {
  name: string;
  classification: DataClassification;
  retentionDays: number;
  encrypted: boolean;
  shareable: boolean;
  description: string;
}

/**
 * Registry of all data fields collected by Locanote.
 * Used for transparency and compliance audits.
 */
export const DATA_REGISTRY: DataField[] = [
  {
    name: "note_content",
    classification: "essential",
    retentionDays: -1, // Until user deletes
    encrypted: true,
    shareable: true, // Via P2P only
    description: "Your note text and formatting",
  },
  {
    name: "note_title",
    classification: "essential",
    retentionDays: -1,
    encrypted: true,
    shareable: true,
    description: "Note titles",
  },
  {
    name: "tags",
    classification: "essential",
    retentionDays: -1,
    encrypted: true,
    shareable: true,
    description: "User-defined tags",
  },
  {
    name: "username",
    classification: "essential",
    retentionDays: -1,
    encrypted: true,
    shareable: false,
    description: "Pseudonymous display name",
  },
  {
    name: "session_timestamp",
    classification: "operational",
    retentionDays: 7,
    encrypted: true,
    shareable: false,
    description: "Session start/end times",
  },
  {
    name: "sync_metadata",
    classification: "operational",
    retentionDays: 1,
    encrypted: true,
    shareable: false,
    description: "P2P sync timestamps (ephemeral)",
  },
  {
    name: "feature_usage_count",
    classification: "analytics",
    retentionDays: 90,
    encrypted: false,
    shareable: false,
    description: "Aggregated feature usage (differential privacy)",
  },
  {
    name: "email_address",
    classification: "prohibited",
    retentionDays: 0,
    encrypted: false,
    shareable: false,
    description: "Never collected",
  },
  {
    name: "ip_address",
    classification: "prohibited",
    retentionDays: 0,
    encrypted: false,
    shareable: false,
    description: "Never stored (ephemeral signaling only)",
  },
  {
    name: "location_data",
    classification: "prohibited",
    retentionDays: 0,
    encrypted: false,
    shareable: false,
    description: "Never collected",
  },
];

// ============================================================================
// GDPR COMPLIANCE
// ============================================================================

/**
 * GDPR Data Subject Rights
 */
export type GDPRRight =
  | "access" // Article 15: Right of access
  | "rectification" // Article 16: Right to rectification
  | "erasure" // Article 17: Right to erasure ("right to be forgotten")
  | "restriction" // Article 18: Right to restriction
  | "portability" // Article 20: Right to data portability
  | "objection"; // Article 21: Right to object

/**
 * Status of a GDPR request.
 */
export interface GDPRRequest {
  id: string;
  right: GDPRRight;
  status: "pending" | "in_progress" | "completed" | "denied";
  createdAt: Date;
  completedAt?: Date;
  data?: unknown; // For access/portability requests
  reason?: string; // If denied
}

/**
 * User data export format (GDPR Article 20).
 */
export interface UserDataExport {
  exportId: string;
  userId: string;
  exportDate: Date;
  format: "json" | "csv" | "html";
  data: {
    profile: unknown;
    notes: unknown[];
    tags: unknown[];
    settings: unknown;
    activityLog: unknown[];
  };
  metadata: {
    version: string;
    dataCategories: string[];
    retentionInfo: string;
  };
}

// ============================================================================
// DIFFERENTIAL PRIVACY
// ============================================================================

/**
 * Differential privacy configuration.
 * Epsilon controls the privacy/utility trade-off.
 * Lower epsilon = more privacy, less accuracy.
 */
export interface DPConfig {
  /** Privacy budget (recommended: 0.1 - 1.0) */
  epsilon: number;
  /** Delta parameter (probability of privacy breach) */
  delta: number;
  /** Type of noise to add */
  noiseType: "laplace" | "gaussian";
  /** Maximum queries per user per day */
  maxQueriesPerDay: number;
}

/**
 * Default differential privacy configuration.
 * Provides strong privacy (ε = 0.5) with reasonable utility.
 */
export const DEFAULT_DP_CONFIG: DPConfig = {
  epsilon: 0.5,
  delta: 1e-6,
  noiseType: "laplace",
  maxQueriesPerDay: 10,
};

/**
 * Privacy-preserving query result.
 */
export interface DPQueryResult<T> {
  value: T;
  epsilonSpent: number;
  remainingBudget: number;
  confidence: number;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

/**
 * Privacy-related event types.
 */
export type PrivacyEventType =
  | "data_access"
  | "data_modification"
  | "data_deletion"
  | "data_export"
  | "data_share"
  | "settings_change"
  | "consent_grant"
  | "consent_revoke"
  | "gdpr_request";

/**
 * Privacy audit log entry.
 * Stored locally, never transmitted.
 */
export interface PrivacyAuditEntry {
  id: string;
  timestamp: number;
  type: PrivacyEventType;
  userId: string;
  resourceId?: string;
  action: string;
  details?: Record<string, unknown>;
  // No IP addresses or device info (privacy-preserving)
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Consent record for a specific data processing activity.
 */
export interface ConsentRecord {
  id: string;
  purpose: string;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  version: string;
}

/**
 * Standard consent purposes.
 */
export type ConsentPurpose =
  | "analytics"
  | "crash_reports"
  | "performance_metrics"
  | "p2p_collaboration"
  | "cloud_backup";

// ============================================================================
// PRIVACY SCORE
// ============================================================================

/**
 * Comprehensive privacy health score.
 */
export interface PrivacyScore {
  /** Overall score (0-100) */
  overall: number;
  /** Data encryption coverage (0-100) */
  encryption: number;
  /** Data minimization score (0-100) */
  minimization: number;
  /** User control granularity (0-100) */
  control: number;
  /** Transparency/auditability (0-100) */
  transparency: number;
  /** Regulatory compliance (0-100) */
  compliance: number;
  /** Last calculated */
  calculatedAt: Date;
  /** Improvement recommendations */
  recommendations: string[];
}

// ============================================================================
// SECURE DELETION
// ============================================================================

/**
 * Secure deletion methods.
 */
export type DeletionMethod = "standard" | "crypto-shred" | "overwrite";

/**
 * Secure deletion options.
 */
export interface SecureDeletionOptions {
  method: DeletionMethod;
  /** For overwrite method: number of passes (1-35) */
  passes?: number;
  /** Verify deletion was successful */
  verify: boolean;
  /** Create audit log entry */
  audit: boolean;
}

/**
 * Result of secure deletion operation.
 */
export interface DeletionResult {
  success: boolean;
  method: DeletionMethod;
  bytesDeleted: number;
  verified: boolean;
  timestamp: Date;
  error?: string;
}

// ============================================================================
// P2P PRIVACY
// ============================================================================

/**
 * Anonymous peer configuration.
 */
export interface AnonymousPeerConfig {
  /** Rotate peer IDs every N minutes (0 = never) */
  rotationInterval: number;
  /** Use ephemeral signaling */
  ephemeralSignaling: boolean;
  /** Minimum encryption level for P2P */
  minEncryptionLevel: "none" | "encrypted" | "e2e-encrypted";
  /** Allow direct connections or require relay */
  connectionPolicy: "direct" | "relay" | "auto";
}

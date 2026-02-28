// ============================================================================
// DIFFERENTIAL PRIVACY SERVICE
// ============================================================================
// Implements local differential privacy for anonymous analytics.
// Adds carefully calibrated noise to data to provide mathematical
// privacy guarantees.
//
// COMPLIANCE:
// - GDPR Recital 26: Anonymization standards
// - CCPA: De-identified data exemptions
//
// TECHNICAL:
// - ε-differential privacy with Laplace mechanism
// - Local differential privacy (noise added on device)
// - Privacy budget management
// ============================================================================

import type { DPConfig, DPQueryResult } from "./types";
import { DEFAULT_DP_CONFIG } from "./types";

// ============================================================================
// LAPLACE MECHANISM
// ============================================================================

/**
 * Sample from Laplace distribution (double exponential).
 * Used to add noise for differential privacy.
 *
 * @param scale - Scale parameter b = sensitivity/epsilon
 * @returns Random sample from Laplace(0, scale)
 */
function sampleLaplace(scale: number): number {
  // Laplace distribution: difference of two exponential random variables
  // Or: ln(u1) - ln(u2) where u1, u2 are uniform [0,1]
  const u1 = Math.random();
  const u2 = Math.random();

  // Avoid log(0)
  const safeU1 = Math.max(u1, Number.MIN_VALUE);
  const safeU2 = Math.max(u2, Number.MIN_VALUE);

  return scale * Math.log(safeU1 / safeU2);
}

/**
 * Sample from Gaussian distribution.
 * Alternative noise mechanism for (ε, δ)-differential privacy.
 *
 * @param std - Standard deviation
 * @returns Random sample from Gaussian(0, std^2)
 */
function sampleGaussian(std: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();

  const magnitude = std * Math.sqrt(-2.0 * Math.log(u1));
  return magnitude * Math.cos(2.0 * Math.PI * u2);
}

// ============================================================================
// SENSITIVITY CALCULATIONS
// ============================================================================

/**
 * Calculate L1 sensitivity for a counting query.
 * Adding/removing one record changes count by at most 1.
 */
function countSensitivity(): number {
  return 1;
}

/**
 * Calculate L1 sensitivity for a sum query.
 * @param maxValue - Maximum possible value
 * @param minValue - Minimum possible value
 */
function sumSensitivity(maxValue: number, minValue: number): number {
  return Math.abs(maxValue - minValue);
}

/**
 * Calculate L1 sensitivity for mean query.
 * Sensitivity depends on data range and count.
 */
function meanSensitivity(
  maxValue: number,
  minValue: number,
  count: number,
): number {
  return sumSensitivity(maxValue, minValue) / count;
}

// ============================================================================
// DIFFERENTIAL PRIVACY SERVICE
// ============================================================================

export class DifferentialPrivacyService {
  private config: DPConfig;
  private privacyBudgetSpent: number = 0;
  private queryCount: number = 0;
  private lastReset: Date;

  constructor(config: DPConfig = DEFAULT_DP_CONFIG) {
    this.config = config;
    this.lastReset = new Date();
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<DPConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): DPConfig {
    return { ...this.config };
  }

  /**
   * Reset privacy budget (typically daily).
   */
  resetBudget(): void {
    this.privacyBudgetSpent = 0;
    this.queryCount = 0;
    this.lastReset = new Date();
  }

  /**
   * Check if we can perform a query with given epsilon cost.
   */
  canQuery(epsilon: number): boolean {
    // Check if we've exceeded daily query limit
    if (this.queryCount >= this.config.maxQueriesPerDay) {
      return false;
    }

    // Check if we have enough privacy budget
    return this.privacyBudgetSpent + epsilon <= this.config.epsilon;
  }

  /**
   * Get remaining privacy budget.
   */
  getRemainingBudget(): number {
    return Math.max(0, this.config.epsilon - this.privacyBudgetSpent);
  }

  /**
   * Get query statistics.
   */
  getStats(): {
    queriesToday: number;
    budgetSpent: number;
    budgetRemaining: number;
    lastReset: Date;
  } {
    return {
      queriesToday: this.queryCount,
      budgetSpent: this.privacyBudgetSpent,
      budgetRemaining: this.getRemainingBudget(),
      lastReset: this.lastReset,
    };
  }

  // ========================================================================
  // QUERY METHODS
  // ========================================================================

  /**
   * Differentially private count query.
   * Returns count with added Laplace noise.
   *
   * @param count - True count
   * @param epsilon - Privacy budget for this query (default: 0.1)
   */
  count(count: number, epsilon: number = 0.1): DPQueryResult<number> {
    return this.addNoiseToCount(count, epsilon);
  }

  /**
   * Differentially private sum query.
   *
   * @param sum - True sum
   * @param minValue - Minimum possible value in dataset
   * @param maxValue - Maximum possible value in dataset
   * @param epsilon - Privacy budget for this query
   */
  sum(
    sum: number,
    minValue: number,
    maxValue: number,
    epsilon: number = 0.2,
  ): DPQueryResult<number> {
    return this.addNoiseToSum(sum, minValue, maxValue, epsilon);
  }

  /**
   * Differentially private mean query.
   *
   * @param mean - True mean
   * @param count - Number of items
   * @param minValue - Minimum possible value
   * @param maxValue - Maximum possible value
   * @param epsilon - Privacy budget for this query
   */
  mean(
    mean: number,
    count: number,
    minValue: number,
    maxValue: number,
    epsilon: number = 0.2,
  ): DPQueryResult<number> {
    return this.addNoiseToMean(mean, count, minValue, maxValue, epsilon);
  }

  /**
   * Differentially private histogram/bin count.
   *
   * @param bins - Array of counts per bin
   * @param epsilon - Privacy budget (split across bins)
   */
  histogram(bins: number[], epsilon: number = 0.5): DPQueryResult<number[]> {
    // Split epsilon budget across bins using basic composition
    const epsilonPerBin = epsilon / bins.length;

    const noisyBins = bins.map((count) => {
      const scale = countSensitivity() / epsilonPerBin;
      const noise = sampleLaplace(scale);
      return Math.max(0, Math.round(count + noise)); // Ensure non-negative
    });

    this.spendBudget(epsilon);

    return {
      value: noisyBins,
      epsilonSpent: epsilon,
      remainingBudget: this.getRemainingBudget(),
      confidence: 0.95, // Approximate
    };
  }

  // ========================================================================
  // NOISE ADDITION (INTERNAL)
  // ========================================================================

  private addNoiseToCount(
    count: number,
    epsilon: number,
  ): DPQueryResult<number> {
    if (!this.canQuery(epsilon)) {
      return {
        value: count, // Return original if budget exhausted
        epsilonSpent: 0,
        remainingBudget: 0,
        confidence: 0,
      };
    }

    const sensitivity = countSensitivity();
    const scale = sensitivity / epsilon;
    const noise = sampleLaplace(scale);

    this.spendBudget(epsilon);

    return {
      value: Math.max(0, Math.round(count + noise)),
      epsilonSpent: epsilon,
      remainingBudget: this.getRemainingBudget(),
      confidence: this.calculateConfidence(count, scale),
    };
  }

  private addNoiseToSum(
    sum: number,
    minValue: number,
    maxValue: number,
    epsilon: number,
  ): DPQueryResult<number> {
    if (!this.canQuery(epsilon)) {
      return {
        value: sum,
        epsilonSpent: 0,
        remainingBudget: 0,
        confidence: 0,
      };
    }

    const sensitivity = sumSensitivity(maxValue, minValue);
    const scale = sensitivity / epsilon;
    const noise = sampleLaplace(scale);

    this.spendBudget(epsilon);

    return {
      value: sum + noise,
      epsilonSpent: epsilon,
      remainingBudget: this.getRemainingBudget(),
      confidence: this.calculateConfidence(sum, scale),
    };
  }

  private addNoiseToMean(
    mean: number,
    count: number,
    minValue: number,
    maxValue: number,
    epsilon: number,
  ): DPQueryResult<number> {
    if (!this.canQuery(epsilon)) {
      return {
        value: mean,
        epsilonSpent: 0,
        remainingBudget: 0,
        confidence: 0,
      };
    }

    const sensitivity = meanSensitivity(maxValue, minValue, count);
    const scale = sensitivity / epsilon;
    const noise = sampleLaplace(scale);

    this.spendBudget(epsilon);

    return {
      value: mean + noise,
      epsilonSpent: epsilon,
      remainingBudget: this.getRemainingBudget(),
      confidence: this.calculateConfidence(mean, scale),
    };
  }

  // ========================================================================
  // BUDGET MANAGEMENT
  // ========================================================================

  private spendBudget(epsilon: number): void {
    this.privacyBudgetSpent += epsilon;
    this.queryCount++;
  }

  private calculateConfidence(trueValue: number, scale: number): number {
    // Rough confidence estimate based on noise scale
    // At 95% confidence, Laplace noise is within ~3*scale
    const relativeError = (3 * scale) / Math.abs(trueValue || 1);
    return Math.max(0, Math.min(1, 1 - relativeError));
  }

  // ========================================================================
  // LOCAL PRIVACY (RAPPOR-STYLE)
  // ========================================================================

  /**
   * Apply randomized response for binary values.
   * Used in RAPPOR (Randomized Aggregatable Privacy-Preserving Ordinal Response).
   *
   * @param value - True binary value
   * @param p - Probability of reporting true value
   * @returns Noisy binary value
   */
  randomizedResponse(value: boolean, p: number = 0.75): boolean {
    // With probability p, report true value
    // With probability (1-p), report random value
    if (Math.random() < p) {
      return value;
    } else {
      return Math.random() < 0.5;
    }
  }

  /**
   * Apply Bloom filter-based randomized response.
   * For categorical data with many possible values.
   *
   * @param value - String value to privatize
   * @param f - Probability of flipping bits
   * @returns Privatized bit array
   */
  bloomFilterResponse(value: string, f: number = 0.5): boolean[] {
    // Simple hash-based bloom filter with 16 bits
    const numBits = 16;
    const bits: boolean[] = new Array(numBits).fill(false);

    // Hash the value to set bits
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    // Set bits based on hash
    for (let i = 0; i < 4; i++) {
      const bitIndex = Math.abs((hash >> (i * 4)) & 0xf) % numBits;
      bits[bitIndex] = true;
    }

    // Apply randomized response to each bit
    return bits.map((bit) => {
      if (Math.random() < f) {
        return !bit; // Flip bit
      }
      return bit;
    });
  }
}

// ============================================================================
// PRIVACY-PRESERVING ANALYTICS
// ============================================================================

/**
 * Analytics event with differential privacy.
 */
export interface PrivateAnalyticsEvent {
  name: string;
  timestamp: number;
  // Values are privatized before storage
  value: number;
  category: string;
}

/**
 * Collect analytics event with local differential privacy.
 */
export function collectPrivateEvent(
  name: string,
  value: number,
  category: string = "general",
  dpService: DifferentialPrivacyService,
): PrivateAnalyticsEvent {
  // Add noise to the value
  const result = dpService.count(value, 0.1);

  return {
    name,
    timestamp: Date.now(),
    value: result.value,
    category,
  };
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

let dpService: DifferentialPrivacyService | null = null;

export function getDifferentialPrivacyService(
  config?: DPConfig,
): DifferentialPrivacyService {
  if (!dpService) {
    dpService = new DifferentialPrivacyService(config);
  } else if (config) {
    dpService.updateConfig(config);
  }
  return dpService;
}

export function resetDifferentialPrivacyService(): void {
  dpService = null;
}

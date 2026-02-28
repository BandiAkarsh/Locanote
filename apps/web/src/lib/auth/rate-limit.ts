// ============================================================================
// RATE LIMITING MODULE
// ============================================================================
// Implements client-side rate limiting for authentication and sensitive
// operations to prevent brute force attacks.
//
// FEATURES:
// - Exponential backoff for repeated failures
// - IP-based and user-based limiting
// - Persistent storage of rate limit state
// - CAPTCHA integration after threshold
//
// SECURITY LEVEL: Prevents automated credential stuffing attacks
// ============================================================================

import type { RateLimitEntry, RateLimitConfig } from "./types";
import { DEFAULT_RATE_LIMIT_CONFIG } from "./types";

// ============================================================================
// CONSTANTS
// ============================================================================

const RATE_LIMIT_KEY = "locanote_rate_limits";
const RATE_LIMIT_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// ============================================================================
// RATE LIMIT STORE
// ============================================================================

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

let rateLimitCache: RateLimitStore = {};
let lastCleanup = Date.now();

/**
 * Get rate limit data from storage
 */
function getRateLimitData(): RateLimitStore {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      return { ...rateLimitCache, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("[RateLimit] Failed to load rate limit data:", e);
  }

  return rateLimitCache;
}

/**
 * Save rate limit data to storage
 */
function saveRateLimitData(data: RateLimitStore): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    rateLimitCache = data;
  } catch (e) {
    console.error("[RateLimit] Failed to save rate limit data:", e);
  }
}

/**
 * Clean up old rate limit entries
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT_CLEANUP_INTERVAL) return;

  const data = getRateLimitData();
  const cleaned: RateLimitStore = {};

  for (const [key, entry] of Object.entries(data)) {
    // Keep entries that are blocked or within the window
    const windowEnd = entry.firstAttempt + DEFAULT_RATE_LIMIT_CONFIG.windowMs;
    const blockEnd = entry.blockExpires ?? 0;

    if (entry.blocked && now < blockEnd) {
      cleaned[key] = entry;
    } else if (!entry.blocked && now < windowEnd) {
      cleaned[key] = entry;
    }
  }

  saveRateLimitData(cleaned);
  lastCleanup = now;
}

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  attempts: number;
  maxAttempts: number;
  remaining: number;
  retryAfter?: number;
  blocked: boolean;
}

/**
 * Check if an operation is allowed based on rate limits
 *
 * @param key - Unique identifier (username, IP hash, etc.)
 * @param config - Optional rate limit configuration
 * @returns Rate limit check result
 */
export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  cleanupOldEntries();

  const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
  const data = getRateLimitData();
  const now = Date.now();

  let entry = data[key];

  if (!entry) {
    entry = {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    };
  }

  // Check if block has expired
  if (entry.blocked && entry.blockExpires) {
    if (now >= entry.blockExpires) {
      entry.blocked = false;
      entry.attempts = 0;
      entry.firstAttempt = now;
      delete entry.blockExpires;
    }
  }

  // Check if window has reset
  if (!entry.blocked && now - entry.firstAttempt > finalConfig.windowMs) {
    entry.attempts = 0;
    entry.firstAttempt = now;
  }

  // If currently blocked, return block status
  if (entry.blocked) {
    const retryAfter = entry.blockExpires
      ? Math.ceil((entry.blockExpires - now) / 1000)
      : Math.ceil(finalConfig.blockDurationMs / 1000);

    return {
      allowed: false,
      attempts: entry.attempts,
      maxAttempts: finalConfig.maxAttempts,
      remaining: 0,
      retryAfter,
      blocked: true,
    };
  }

  // Check if limit exceeded
  const remaining = Math.max(0, finalConfig.maxAttempts - entry.attempts);
  const allowed = entry.attempts < finalConfig.maxAttempts;

  return {
    allowed,
    attempts: entry.attempts,
    maxAttempts: finalConfig.maxAttempts,
    remaining,
    blocked: false,
  };
}

/**
 * Record a failed attempt
 *
 * @param key - Unique identifier
 * @param config - Optional rate limit configuration
 * @returns Updated rate limit result
 */
export function recordFailedAttempt(
  key: string,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
  const data = getRateLimitData();
  const now = Date.now();

  let entry = data[key];

  if (!entry) {
    entry = {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    };
  }

  // Reset if window expired
  if (now - entry.firstAttempt > finalConfig.windowMs) {
    entry.attempts = 0;
    entry.firstAttempt = now;
    entry.blocked = false;
    delete entry.blockExpires;
  }

  entry.attempts++;
  entry.lastAttempt = now;

  // Check if should block
  if (entry.attempts >= finalConfig.maxAttempts) {
    entry.blocked = true;

    if (finalConfig.exponentialBackoff) {
      // Exponential backoff: 1x, 2x, 4x, 8x base duration
      const overflow = entry.attempts - finalConfig.maxAttempts;
      const multiplier = Math.pow(2, Math.min(overflow, 4));
      entry.blockExpires = now + finalConfig.blockDurationMs * multiplier;
    } else {
      entry.blockExpires = now + finalConfig.blockDurationMs;
    }
  }

  data[key] = entry;
  saveRateLimitData(data);

  return checkRateLimit(key, config);
}

/**
 * Record a successful attempt (resets counter)
 *
 * @param key - Unique identifier
 */
export function recordSuccess(key: string): void {
  const data = getRateLimitData();

  if (data[key]) {
    delete data[key];
    saveRateLimitData(data);
  }
}

/**
 * Get current rate limit status for a key
 *
 * @param key - Unique identifier
 * @returns Current rate limit entry or undefined
 */
export function getRateLimitStatus(key: string): RateLimitEntry | undefined {
  const data = getRateLimitData();
  return data[key];
}

/**
 * Clear rate limit for a key (e.g., after successful CAPTCHA)
 *
 * @param key - Unique identifier
 */
export function clearRateLimit(key: string): void {
  const data = getRateLimitData();

  if (data[key]) {
    delete data[key];
    saveRateLimitData(data);
  }
}

/**
 * Reset all rate limits (use with caution)
 */
export function resetAllRateLimits(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(RATE_LIMIT_KEY);
  }
  rateLimitCache = {};
}

// ============================================================================
// CAPTCHA INTEGRATION
// ============================================================================

let captchaProvider: CaptchaProvider | null = null;

export interface CaptchaProvider {
  verify(): Promise<boolean>;
  isConfigured(): boolean;
}

/**
 * Set CAPTCHA provider for rate limiting
 *
 * @param provider - CAPTCHA provider implementation
 */
export function setCaptchaProvider(provider: CaptchaProvider): void {
  captchaProvider = provider;
}

/**
 * Check if CAPTCHA is required for this key
 *
 * @param key - Unique identifier
 * @returns true if CAPTCHA should be shown
 */
export function isCaptchaRequired(key: string): boolean {
  const status = checkRateLimit(key);
  // Show CAPTCHA after 3 failed attempts or when blocked
  return status.attempts >= 3 || status.blocked;
}

/**
 * Verify CAPTCHA and clear rate limit if successful
 *
 * @param key - Unique identifier
 * @returns true if verification succeeded
 */
export async function verifyCaptcha(key: string): Promise<boolean> {
  if (!captchaProvider || !captchaProvider.isConfigured()) {
    return false;
  }

  const verified = await captchaProvider.verify();

  if (verified) {
    clearRateLimit(key);
  }

  return verified;
}

// ============================================================================
// BACKOFF CALCULATION
// ============================================================================

/**
 * Calculate delay for exponential backoff
 *
 * @param attempt - Attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay for this attempt
 */
export function calculateBackoff(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000,
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for backoff duration
 *
 * @param attempt - Attempt number
 * @param baseDelay - Base delay
 * @returns Promise that resolves after delay
 */
export async function backoffDelay(
  attempt: number,
  baseDelay = 1000,
): Promise<void> {
  const delay = calculateBackoff(attempt, baseDelay);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccess,
  getRateLimitStatus,
  clearRateLimit,
  resetAllRateLimits,
  isCaptchaRequired,
  verifyCaptcha,
  setCaptchaProvider,
  calculateBackoff,
  backoffDelay,
};

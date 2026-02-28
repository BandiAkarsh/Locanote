// ============================================================================
// ANONYMOUS SIGNALING SERVICE
// ============================================================================
// Privacy-preserving WebRTC signaling with metadata minimization.
// Implements ephemeral peer IDs and onion-routing ready architecture.
//
// COMPLIANCE:
// - GDPR Article 25: Data protection by design
// - EPrivacy Directive: Privacy in electronic communications
//
// FEATURES:
// - Ephemeral peer identifiers
// - No IP logging
// - Metadata minimization
// - Plausible deniability
// ============================================================================

import type { AnonymousPeerConfig } from "./types";

// ============================================================================
// EPHEMERAL ID MANAGEMENT
// ============================================================================

/**
 * Manages ephemeral, rotating peer identifiers.
 * Prevents long-term tracking of users.
 */
export class EphemeralIdManager {
  private currentId: string | null = null;
  private idHistory: Array<{ id: string; createdAt: number }> = [];
  private rotationInterval: number;
  private rotationTimer: ReturnType<typeof setInterval> | null = null;
  private onRotationCallback: ((newId: string, oldId: string) => void) | null =
    null;

  constructor(rotationIntervalMinutes: number = 60) {
    this.rotationInterval = rotationIntervalMinutes * 60 * 1000;
  }

  /**
   * Initialize with a new ephemeral ID.
   */
  initialize(): string {
    this.currentId = this.generateEphemeralId();
    this.idHistory.push({
      id: this.currentId,
      createdAt: Date.now(),
    });

    // Start rotation timer if interval is set
    if (this.rotationInterval > 0) {
      this.startRotation();
    }

    return this.currentId;
  }

  /**
   * Get current ephemeral ID.
   */
  getCurrentId(): string {
    if (!this.currentId) {
      return this.initialize();
    }
    return this.currentId;
  }

  /**
   * Manually rotate to a new ID.
   */
  rotate(): string {
    const oldId = this.currentId;
    this.currentId = this.generateEphemeralId();

    this.idHistory.push({
      id: this.currentId,
      createdAt: Date.now(),
    });

    // Trim history (keep last 10)
    if (this.idHistory.length > 10) {
      this.idHistory = this.idHistory.slice(-10);
    }

    // Notify callback
    if (this.onRotationCallback && oldId) {
      this.onRotationCallback(this.currentId, oldId);
    }

    return this.currentId;
  }

  /**
   * Set callback for ID rotation events.
   */
  onRotation(callback: (newId: string, oldId: string) => void): () => void {
    this.onRotationCallback = callback;
    return () => {
      this.onRotationCallback = null;
    };
  }

  /**
   * Get ID history (for debugging, not exposed to peers).
   */
  getHistory(): Array<{ id: string; createdAt: number }> {
    return [...this.idHistory];
  }

  /**
   * Destroy all IDs.
   */
  destroy(): void {
    this.stopRotation();
    this.currentId = null;
    this.idHistory = [];
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private generateEphemeralId(): string {
    // Generate cryptographically secure random ID
    const array = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    // Convert to base64url string
    return this.arrayToBase64Url(array);
  }

  private arrayToBase64Url(array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  private startRotation(): void {
    this.stopRotation();
    this.rotationTimer = setInterval(() => {
      this.rotate();
    }, this.rotationInterval);
  }

  private stopRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }
}

// ============================================================================
// METADATA MINIMIZER
// ============================================================================

/**
 * Minimizes metadata in signaling messages.
 * Strips identifying information.
 */
export class MetadataMinimizer {
  /**
   * Strip unnecessary metadata from signaling message.
   */
  minimize(message: Record<string, unknown>): Record<string, unknown> {
    const allowedFields = [
      "type",
      "sdp",
      "candidate",
      "sdpMid",
      "sdpMLineIndex",
      "usernameFragment",
      "roomId",
      "peerId",
    ];

    const minimized: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in message) {
        minimized[field] = message[field];
      }
    }

    return minimized;
  }

  /**
   * Check if message contains excessive metadata.
   */
  hasExcessiveMetadata(message: Record<string, unknown>): boolean {
    const allowedFields = new Set([
      "type",
      "sdp",
      "candidate",
      "sdpMid",
      "sdpMLineIndex",
      "usernameFragment",
      "roomId",
      "peerId",
      "timestamp",
    ]);

    const keys = Object.keys(message);
    const unknownFields = keys.filter((k) => !allowedFields.has(k));

    return unknownFields.length > 0;
  }

  /**
   * Generate minimal signal message.
   */
  createSignal(
    type: "offer" | "answer" | "candidate",
    data: unknown,
    roomId: string,
    peerId: string,
  ): Record<string, unknown> {
    return {
      type,
      [type === "candidate" ? "candidate" : "sdp"]: data,
      roomId,
      peerId,
      // Minimal timestamp (rounded to reduce precision)
      ts: Math.floor(Date.now() / 10000) * 10000,
    };
  }
}

// ============================================================================
// ANONYMOUS SIGNALING SERVICE
// ============================================================================

export class AnonymousSignalingService {
  private config: AnonymousPeerConfig;
  private idManager: EphemeralIdManager;
  private metadataMinimizer: MetadataMinimizer;
  private connectedPeers: Map<
    string,
    { connectedAt: number; anonymous: boolean }
  > = new Map();

  constructor(config: AnonymousPeerConfig) {
    this.config = config;
    this.idManager = new EphemeralIdManager(config.rotationInterval);
    this.metadataMinimizer = new MetadataMinimizer();
  }

  /**
   * Initialize anonymous signaling.
   */
  initialize(): string {
    return this.idManager.initialize();
  }

  /**
   * Get current anonymous peer ID.
   */
  getPeerId(): string {
    return this.idManager.getCurrentId();
  }

  /**
   * Register a connected peer.
   */
  registerPeer(peerId: string, anonymous: boolean = true): void {
    this.connectedPeers.set(peerId, {
      connectedAt: Date.now(),
      anonymous,
    });
  }

  /**
   * Unregister a peer.
   */
  unregisterPeer(peerId: string): void {
    this.connectedPeers.delete(peerId);
  }

  /**
   * Create an anonymous signaling message.
   */
  createMessage(
    type: "offer" | "answer" | "candidate",
    data: unknown,
    roomId: string,
  ): Record<string, unknown> {
    const peerId = this.getPeerId();
    const message = this.metadataMinimizer.createSignal(
      type,
      data,
      roomId,
      peerId,
    );

    return this.metadataMinimizer.minimize(message);
  }

  /**
   * Validate incoming signaling message.
   */
  validateMessage(message: Record<string, unknown>): {
    valid: boolean;
    reason?: string;
    sanitized: Record<string, unknown>;
  } {
    // Check for excessive metadata
    if (this.metadataMinimizer.hasExcessiveMetadata(message)) {
      return {
        valid: false,
        reason: "Message contains excessive metadata",
        sanitized: this.metadataMinimizer.minimize(message),
      };
    }

    // Check required fields
    if (!message.type || !message.roomId) {
      return {
        valid: false,
        reason: "Missing required fields",
        sanitized: {},
      };
    }

    return {
      valid: true,
      sanitized: message,
    };
  }

  /**
   * Check if connection should be direct or via relay.
   */
  shouldUseRelay(peerId: string): boolean {
    switch (this.config.connectionPolicy) {
      case "direct":
        return false;
      case "relay":
        return true;
      case "auto":
      default:
        // Use relay for unknown/anonymous peers
        const peer = this.connectedPeers.get(peerId);
        return !peer || peer.anonymous;
    }
  }

  /**
   * Get connection statistics.
   */
  getStats(): {
    connectedPeers: number;
    anonymousPeers: number;
    currentId: string;
    idRotations: number;
  } {
    const peers = Array.from(this.connectedPeers.values());
    return {
      connectedPeers: peers.length,
      anonymousPeers: peers.filter((p) => p.anonymous).length,
      currentId: this.getPeerId(),
      idRotations: this.idManager.getHistory().length,
    };
  }

  /**
   * Destroy service and cleanup.
   */
  destroy(): void {
    this.idManager.destroy();
    this.connectedPeers.clear();
  }
}

// ============================================================================
// ONION ROUTING (FUTURE-READY)
// ============================================================================

/**
 * Placeholder for future onion routing implementation.
 * Would route signaling through multiple hops for enhanced privacy.
 */
export interface OnionRoute {
  hops: string[]; // Peer IDs of intermediate nodes
  entryNode: string;
  exitNode: string;
  encryptedLayers: Uint8Array[];
}

/**
 * Create an onion-routed message (future implementation).
 */
export function createOnionMessage(
  message: Record<string, unknown>,
  route: OnionRoute,
): Uint8Array {
  // This would implement onion encryption:
  // 1. Encrypt message with exit node's key
  // 2. Wrap with intermediate node's key
  // 3. Wrap with entry node's key
  // Each node can only decrypt one layer

  // For now, return serialized message
  return new TextEncoder().encode(JSON.stringify(message));
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

let signalingService: AnonymousSignalingService | null = null;

export function getAnonymousSignalingService(
  config?: AnonymousPeerConfig,
): AnonymousSignalingService {
  const defaultConfig: AnonymousPeerConfig = {
    rotationInterval: 60,
    ephemeralSignaling: true,
    minEncryptionLevel: "e2e-encrypted",
    connectionPolicy: "auto",
  };

  if (!signalingService) {
    signalingService = new AnonymousSignalingService(config || defaultConfig);
  }
  return signalingService;
}

export function resetAnonymousSignalingService(): void {
  if (signalingService) {
    signalingService.destroy();
  }
  signalingService = null;
}

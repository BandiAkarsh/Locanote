// ============================================================================
// CRDT MODULE TYPES
// ============================================================================
// Abstract interfaces for collaborative document management.
// These types are implementation-agnostic - they don't reference Yjs
// directly, making the module easily replaceable.
//
// CURRENT IMPLEMENTATION: Yjs with y-indexeddb + y-webrtc
//
// FUTURE IMPLEMENTATIONS COULD USE:
// - Automerge
// - Electric SQL
// - PowerSync
// - Loro
// - Any CRDT library
//
// TO SWAP CRDT LIBRARY:
// 1. Implement CollaborativeDocument interface
// 2. Implement DocumentProvider interface
// 3. Update the factory function
// ============================================================================

// ============================================================================
// CONNECTION STATUS
// ============================================================================

/**
 * Represents the connection status of a document provider.
 */
export interface ConnectionStatus {
  /** Whether connected to the network/peers */
  connected: boolean;
  /** Number of connected peers (for P2P providers) */
  peerCount: number;
  /** Whether connected to signaling/coordination server */
  signalingConnected: boolean;
}

// ============================================================================
// DOCUMENT METADATA
// ============================================================================

/**
 * Metadata for a collaborative document.
 */
export interface DocumentMeta {
  /** When the document was created */
  createdAt: number;
  /** When the document was last updated */
  updatedAt: number;
  /** Additional custom metadata */
  [key: string]: unknown;
}

// ============================================================================
// USER PRESENCE
// ============================================================================

/**
 * Represents a user's presence in a collaborative session.
 */
export interface UserPresence {
  /** User's display name */
  name: string;
  /** User's cursor/avatar color */
  color: string;
  /** User's unique ID */
  id: string;
}

// ============================================================================
// COLLABORATIVE DOCUMENT INTERFACE
// ============================================================================

/**
 * Abstract interface for a collaborative document.
 * Encapsulates all CRDT operations without exposing implementation details.
 *
 * @example Usage:
 * ```typescript
 * const doc = await openCollaborativeDocument(noteId);
 *
 * // Read/write title
 * console.log(doc.getTitle());
 * doc.setTitle("New Title");
 *
 * // React to changes
 * const unsubscribe = doc.onTitleChange((title) => {
 *   console.log("Title changed to:", title);
 * });
 *
 * // Clean up
 * unsubscribe();
 * doc.destroy();
 * ```
 */
export interface CollaborativeDocument {
  /** Unique identifier for this document */
  readonly id: string;

  // ---------------------------------------------------------------------------
  // Title Operations
  // ---------------------------------------------------------------------------

  /** Get the current title */
  getTitle(): string;

  /** Set the title */
  setTitle(value: string): void;

  /** Subscribe to title changes */
  onTitleChange(callback: (title: string) => void): () => void;

  // ---------------------------------------------------------------------------
  // Tags Operations
  // ---------------------------------------------------------------------------

  /** Get all tags */
  getTags(): string[];

  /** Add a tag */
  addTag(tag: string): void;

  /** Remove a tag */
  removeTag(tag: string): void;

  /** Set all tags (replaces existing) */
  setTags(tags: string[]): void;

  /** Subscribe to tag changes */
  onTagsChange(callback: (tags: string[]) => void): () => void;

  // ---------------------------------------------------------------------------
  // Metadata Operations
  // ---------------------------------------------------------------------------

  /** Get document metadata */
  getMeta(): DocumentMeta;

  /** Update a metadata field */
  updateMeta(key: string, value: unknown): void;

  /** Subscribe to metadata changes */
  onMetaChange(callback: (meta: DocumentMeta) => void): () => void;

  // ---------------------------------------------------------------------------
  // Raw Access (For Editor Integration)
  // ---------------------------------------------------------------------------
  // These methods expose the raw CRDT objects for editor integration.
  // Consumers should treat these as opaque types.

  /** Get raw document object (opaque - for editor integration) */
  getRawDocument(): unknown;

  /** Get raw content fragment (opaque - for editor integration) */
  getRawContent(): unknown;

  // ---------------------------------------------------------------------------
  // Persistence Status
  // ---------------------------------------------------------------------------

  /** Whether the document is synced with local storage */
  isSynced(): boolean;

  /** Subscribe to sync status changes */
  onSyncStatusChange(callback: (synced: boolean) => void): () => void;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /** Destroy the document and clean up resources */
  destroy(): void;
}

// ============================================================================
// DOCUMENT PROVIDER INTERFACE
// ============================================================================

/**
 * Abstract interface for network synchronization provider.
 * Handles P2P or server-based sync of collaborative documents.
 */
export interface DocumentProvider {
  /** Unique identifier for this provider/room */
  readonly roomId: string;

  /** Whether the provider is currently connected */
  isConnected(): boolean;

  /** Get the number of connected peers */
  getPeerCount(): number;

  /** Get detailed connection status */
  getStatus(): ConnectionStatus;

  /** Set user presence/awareness */
  setUserPresence(user: UserPresence): void;

  /** Subscribe to connection status changes */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void;

  /** Subscribe to peer count changes */
  onPeersChange(callback: (count: number) => void): () => void;

  /** Connect to the network */
  connect(): void;

  /** Disconnect from the network */
  disconnect(): void;

  /** Destroy the provider and clean up resources */
  destroy(): void;
}

// ============================================================================
// DOCUMENT HANDLE (COMBINED)
// ============================================================================

/**
 * Combined handle for a collaborative document with its network provider.
 * This is what consumers typically work with.
 */
export interface DocumentHandle {
  /** The collaborative document */
  document: CollaborativeDocument;

  /** The network provider (optional - may be null if offline-only) */
  provider: DocumentProvider | null;

  /** Destroy both document and provider */
  destroy(): void;
}

// ============================================================================
// FACTORY INTERFACE
// ============================================================================

/**
 * Factory interface for creating collaborative documents.
 */
export interface CollaborativeDocumentFactory {
  /**
   * Open or create a collaborative document.
   *
   * @param documentId - Unique document identifier
   * @param user - Current user's presence info
   * @returns DocumentHandle with document and provider
   */
  open(documentId: string, user?: UserPresence): DocumentHandle;

  /**
   * Check if a document is currently open.
   */
  isOpen(documentId: string): boolean;

  /**
   * Get an already-open document.
   */
  get(documentId: string): CollaborativeDocument | undefined;

  /**
   * Close a document and clean up resources.
   */
  close(documentId: string): void;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error thrown when a document operation fails.
 */
export class DocumentError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DocumentError";
  }
}

/**
 * Error thrown when a document is not found.
 */
export class DocumentNotFoundError extends Error {
  constructor(documentId: string) {
    super(`Document not found: ${documentId}`);
    this.name = "DocumentNotFoundError";
  }
}

/**
 * Error thrown when sync fails.
 */
export class SyncError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SyncError";
  }
}

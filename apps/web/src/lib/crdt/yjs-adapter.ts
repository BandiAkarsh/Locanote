// ============================================================================
// YJS COLLABORATIVE DOCUMENT ADAPTER
// ============================================================================
// Implementation of CollaborativeDocument interface using Yjs.
// This wraps the existing Yjs functionality in the abstract interface.
//
// TO SWAP TO ANOTHER CRDT LIBRARY:
// 1. Create a new adapter file (e.g., automerge-adapter.ts)
// 2. Implement CollaborativeDocument interface
// 3. Update index.ts to export new implementation
// ============================================================================

import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import type {
  CollaborativeDocument,
  DocumentProvider,
  DocumentHandle,
  DocumentMeta,
  ConnectionStatus,
  UserPresence,
  CollaborativeDocumentFactory,
} from "./types";
import {
  createWebRTCProvider,
  destroyWebRTCProvider,
  getWebRTCStatus,
} from "./providers";
import type { WebrtcProvider } from "y-webrtc";

// ============================================================================
// YJS DOCUMENT ADAPTER
// ============================================================================

/**
 * Yjs implementation of CollaborativeDocument interface.
 */
class YjsCollaborativeDocument implements CollaborativeDocument {
  private readonly doc: Y.Doc;
  private readonly persistence: IndexeddbPersistence;
  private readonly content: Y.XmlFragment;
  private readonly title: Y.Text;
  private readonly tags: Y.Array<string>;
  private readonly meta: Y.Map<unknown>;
  private synced = false;

  constructor(
    public readonly id: string,
    doc: Y.Doc,
    persistence: IndexeddbPersistence,
  ) {
    this.doc = doc;
    this.persistence = persistence;
    this.content = doc.getXmlFragment("content");
    this.title = doc.getText("title");
    this.tags = doc.getArray<string>("tags");
    this.meta = doc.getMap("meta");

    // Initialize meta if needed
    if (this.meta.get("createdAt") === undefined) {
      this.meta.set("createdAt", Date.now());
      this.meta.set("updatedAt", Date.now());
    }

    // Track sync status
    persistence.on("synced", () => {
      this.synced = true;
    });
  }

  // ---------------------------------------------------------------------------
  // Title Operations
  // ---------------------------------------------------------------------------

  getTitle(): string {
    return this.title.toString();
  }

  setTitle(value: string): void {
    this.doc.transact(() => {
      this.title.delete(0, this.title.length);
      this.title.insert(0, value);
      this.meta.set("updatedAt", Date.now());
    });
  }

  onTitleChange(callback: (title: string) => void): () => void {
    const handler = () => callback(this.title.toString());
    this.title.observe(handler);
    return () => this.title.unobserve(handler);
  }

  // ---------------------------------------------------------------------------
  // Tags Operations
  // ---------------------------------------------------------------------------

  getTags(): string[] {
    return this.tags.toArray();
  }

  addTag(tag: string): void {
    if (!this.tags.toArray().includes(tag)) {
      this.doc.transact(() => {
        this.tags.push([tag]);
        this.meta.set("updatedAt", Date.now());
      });
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.toArray().indexOf(tag);
    if (index !== -1) {
      this.doc.transact(() => {
        this.tags.delete(index, 1);
        this.meta.set("updatedAt", Date.now());
      });
    }
  }

  setTags(tags: string[]): void {
    this.doc.transact(() => {
      this.tags.delete(0, this.tags.length);
      this.tags.push(tags);
      this.meta.set("updatedAt", Date.now());
    });
  }

  onTagsChange(callback: (tags: string[]) => void): () => void {
    const handler = () => callback(this.tags.toArray());
    this.tags.observe(handler);
    return () => this.tags.unobserve(handler);
  }

  // ---------------------------------------------------------------------------
  // Metadata Operations
  // ---------------------------------------------------------------------------

  getMeta(): DocumentMeta {
    return {
      createdAt: (this.meta.get("createdAt") as number) || Date.now(),
      updatedAt: (this.meta.get("updatedAt") as number) || Date.now(),
      ...Object.fromEntries(this.meta.entries()),
    };
  }

  updateMeta(key: string, value: unknown): void {
    this.meta.set(key, value);
    this.meta.set("updatedAt", Date.now());
  }

  onMetaChange(callback: (meta: DocumentMeta) => void): () => void {
    const handler = () => callback(this.getMeta());
    this.meta.observe(handler);
    return () => this.meta.unobserve(handler);
  }

  // ---------------------------------------------------------------------------
  // Raw Access
  // ---------------------------------------------------------------------------

  getRawDocument(): Y.Doc {
    return this.doc;
  }

  getRawContent(): Y.XmlFragment {
    return this.content;
  }

  // ---------------------------------------------------------------------------
  // Persistence Status
  // ---------------------------------------------------------------------------

  isSynced(): boolean {
    return this.synced;
  }

  onSyncStatusChange(callback: (synced: boolean) => void): () => void {
    const handler = () => callback(true);
    this.persistence.on("synced", handler);
    return () => {
      // IndexeddbPersistence doesn't have an off method, so we can't unsubscribe
      // This is a limitation of the y-indexeddb library
    };
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  destroy(): void {
    this.persistence.destroy();
    this.doc.destroy();
  }
}

// ============================================================================
// WEBRTC PROVIDER ADAPTER
// ============================================================================

/**
 * Yjs WebRTC implementation of DocumentProvider interface.
 */
class YjsWebRTCProvider implements DocumentProvider {
  constructor(
    public readonly roomId: string,
    private readonly provider: WebrtcProvider,
  ) {}

  isConnected(): boolean {
    return this.provider.connected;
  }

  getPeerCount(): number {
    return getWebRTCStatus(this.provider).peerCount;
  }

  getStatus(): ConnectionStatus {
    return getWebRTCStatus(this.provider);
  }

  setUserPresence(user: UserPresence): void {
    if (this.provider.awareness) {
      this.provider.awareness.setLocalState({ user });
    }
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    const handler = () => callback(this.getStatus());
    this.provider.on("status", handler);
    this.provider.on("peers", handler);
    return () => {
      this.provider.off("status", handler);
      this.provider.off("peers", handler);
    };
  }

  onPeersChange(callback: (count: number) => void): () => void {
    const handler = () => callback(this.getPeerCount());
    this.provider.on("peers", handler);
    return () => this.provider.off("peers", handler);
  }

  connect(): void {
    this.provider.connect();
  }

  disconnect(): void {
    this.provider.disconnect();
  }

  destroy(): void {
    destroyWebRTCProvider(this.provider);
  }
}

// ============================================================================
// DOCUMENT FACTORY
// ============================================================================

// Active documents and reference counting
const activeDocuments = new Map<string, YjsCollaborativeDocument>();
const activePersistence = new Map<string, IndexeddbPersistence>();
const refCounts = new Map<string, number>();

/**
 * Yjs implementation of CollaborativeDocumentFactory.
 */
class YjsDocumentFactory implements CollaborativeDocumentFactory {
  open(documentId: string, user?: UserPresence): DocumentHandle {
    // Increment reference count
    const count = refCounts.get(documentId) || 0;
    refCounts.set(documentId, count + 1);

    // Return existing document if already open
    if (activeDocuments.has(documentId)) {
      const existingDoc = activeDocuments.get(documentId)!;

      // Create new provider for this handle
      let provider: YjsWebRTCProvider | null = null;
      if (user && typeof window !== "undefined") {
        try {
          const webrtcProvider = createWebRTCProvider(
            documentId,
            existingDoc.getRawDocument() as Y.Doc,
            user,
          );
          provider = new YjsWebRTCProvider(documentId, webrtcProvider);
        } catch (e) {
          console.warn("[Yjs] Failed to create WebRTC provider:", e);
        }
      }

      return {
        document: existingDoc,
        provider,
        destroy: () => this.close(documentId),
      };
    }

    // Create new document
    const doc = new Y.Doc();
    const persistence = new IndexeddbPersistence(`locanote-${documentId}`, doc);
    const collaborativeDoc = new YjsCollaborativeDocument(
      documentId,
      doc,
      persistence,
    );

    activeDocuments.set(documentId, collaborativeDoc);
    activePersistence.set(documentId, persistence);

    // Create provider if user is provided
    let provider: YjsWebRTCProvider | null = null;
    if (user && typeof window !== "undefined") {
      try {
        const webrtcProvider = createWebRTCProvider(documentId, doc, user);
        provider = new YjsWebRTCProvider(documentId, webrtcProvider);
      } catch (e) {
        console.warn("[Yjs] Failed to create WebRTC provider:", e);
      }
    }

    return {
      document: collaborativeDoc,
      provider,
      destroy: () => this.close(documentId),
    };
  }

  isOpen(documentId: string): boolean {
    return activeDocuments.has(documentId);
  }

  get(documentId: string): CollaborativeDocument | undefined {
    return activeDocuments.get(documentId);
  }

  close(documentId: string): void {
    const count = refCounts.get(documentId) || 0;

    if (count <= 1) {
      // Last reference, destroy the document
      const doc = activeDocuments.get(documentId);
      if (doc) {
        doc.destroy();
        activeDocuments.delete(documentId);
      }
      activePersistence.delete(documentId);
      refCounts.delete(documentId);
      console.log(`[Yjs] Document ${documentId} fully closed`);
    } else {
      // Other references exist
      refCounts.set(documentId, count - 1);
      console.log(`[Yjs] Document ${documentId} reference count: ${count - 1}`);
    }
  }
}

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

/** Default Yjs document factory */
export const yjsDocumentFactory = new YjsDocumentFactory();

/**
 * Create a new Yjs document factory instance.
 */
export function createYjsDocumentFactory(): CollaborativeDocumentFactory {
  return new YjsDocumentFactory();
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Open a collaborative document (convenience function).
 */
export function openCollaborativeDocument(
  documentId: string,
  user?: UserPresence,
): DocumentHandle {
  return yjsDocumentFactory.open(documentId, user);
}

/**
 * Get an open collaborative document.
 */
export function getCollaborativeDocument(
  documentId: string,
): CollaborativeDocument | undefined {
  return yjsDocumentFactory.get(documentId);
}

/**
 * Close a collaborative document.
 */
export function closeCollaborativeDocument(documentId: string): void {
  yjsDocumentFactory.close(documentId);
}

// ============================================================================
// CRDT MODULE INDEX
// ============================================================================
// Central export point for collaborative document functionality.
//
// ARCHITECTURE:
// - types.ts: Abstract interfaces (CollaborativeDocument, DocumentProvider)
// - yjs-adapter.ts: Yjs implementation
// - doc.svelte.ts: Legacy API (for backward compatibility)
// - providers.ts: WebRTC provider utilities
//
// TO SWAP CRDT LIBRARY:
// 1. Create new adapter implementing interfaces from types.ts
// 2. Update this file to export new implementations
// 3. All consuming code continues to work unchanged
// ============================================================================

// ============================================================================
// TYPES (Abstract Interfaces)
// ============================================================================

export type {
  CollaborativeDocument,
  DocumentProvider,
  DocumentHandle,
  DocumentMeta,
  ConnectionStatus,
  UserPresence,
  CollaborativeDocumentFactory,
} from "./types";

export { DocumentError, DocumentNotFoundError, SyncError } from "./types";

// ============================================================================
// YJS ADAPTER (Current Implementation)
// ============================================================================

export {
  yjsDocumentFactory,
  createYjsDocumentFactory,
  openCollaborativeDocument,
  getCollaborativeDocument,
  closeCollaborativeDocument,
} from "./yjs-adapter";

// Default factory alias
export { yjsDocumentFactory as documentFactory } from "./yjs-adapter";

// ============================================================================
// LEGACY API (For Backward Compatibility)
// ============================================================================
// These exports maintain compatibility with existing code.
// New code should prefer the CollaborativeDocument interface.

export {
  openDocument,
  closeDocument,
  getDocument,
  isDocumentOpen,
  getDocumentText,
  getDocumentMeta,
} from "./doc.svelte";

export {
  createWebRTCProvider,
  destroyWebRTCProvider,
  getWebRTCStatus,
  setAwareness,
  type WebrtcProvider,
} from "./providers";

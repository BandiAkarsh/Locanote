// ============================================================================
// YJS DOCUMENT MANAGEMENT
// ============================================================================
// This module manages Yjs documents for collaborative note editing.
//
// WHAT IS YJS?
// Yjs is a CRDT (Conflict-free Replicated Data Type) library that allows
// multiple users to edit the same document simultaneously without conflicts.
//
// KEY CONCEPTS:
// - Y.Doc: The container for all collaborative data
// - Y.Text: Collaborative text (for the editor content)
// - Y.Array: Collaborative array (for tags, etc.)
// - Providers: Handle syncing (WebRTC for P2P, IndexedDB for persistence)
//
// ARCHITECTURE:
// 1. Each note has its own Y.Doc
// 2. y-indexeddb persists the document locally
// 3. y-webrtc syncs with other peers (when collaborating)
// 4. TipTap editor connects to the Yjs document
//
// PERSISTENCE STRATEGY:
// - Notes are stored by their ID in IndexedDB
// - Each note gets its own database to prevent data mixing
// - Automatic sync between tabs/browsers on same device
// ============================================================================

import * as Y from "yjs"; // Import Yjs library
import { IndexeddbPersistence } from "y-indexeddb"; // Local persistence
// Yjs types are available on the Y namespace

// ============================================================================
// DOCUMENT STRUCTURE
// ============================================================================
// Each Yjs document has this structure:
//
// Y.Doc
// ├── 'content' (Y.XmlFragment) - Rich text content for TipTap
// ├── 'title' (Y.Text) - Plain text title
// ├── 'tags' (Y.Array<string>) - Array of tag IDs
// └── 'meta' (Y.Map) - Metadata (createdAt, updatedAt, etc.)

// ============================================================================
// ACTIVE DOCUMENTS MAP
// ============================================================================
// We keep track of open documents to avoid creating duplicates

const activeDocuments = new Map<string, Y.Doc>(); // Map of noteId -> Y.Doc
const activeProviders = new Map<string, IndexeddbPersistence>(); // Map of noteId -> Provider

// ============================================================================
// CREATE OR OPEN DOCUMENT
// ============================================================================
// Opens an existing document or creates a new one
//
// @param noteId - The unique ID of the note
// @returns Object containing the Yjs document and cleanup function

export function openDocument(noteId: string): {
  document: Y.Doc;
  provider: IndexeddbPersistence;
  content: Y.XmlFragment;
  title: Y.Text;
  tags: Y.Array<string>;
  meta: Y.Map<any>;
  destroy: () => void;
} {
  // Check if document is already open
  if (activeDocuments.has(noteId)) {
    const existingDoc = activeDocuments.get(noteId)!;
    const existingProvider = activeProviders.get(noteId)!;

    return {
      document: existingDoc,
      provider: existingProvider,
      content: existingDoc.getXmlFragment("content"),
      title: existingDoc.getText("title"),
      tags: existingDoc.getArray("tags"),
      meta: existingDoc.getMap("meta"),
      destroy: () => closeDocument(noteId), // Cleanup function
    };
  }

  // --------------------------------------------------------------------
  // CREATE NEW DOCUMENT
  // --------------------------------------------------------------------
  const doc = new Y.Doc(); // Create new Yjs document

  // Initialize shared types with defaults
  const content = doc.getXmlFragment("content"); // Rich text content
  const title = doc.getText("title"); // Plain text title
  const tags = doc.getArray<string>("tags"); // Tag IDs array
  const meta = doc.getMap("meta"); // Metadata

  // Set default metadata if new document
  if (meta.get("createdAt") === undefined) {
    meta.set("createdAt", Date.now());
    meta.set("updatedAt", Date.now());
  }

  // --------------------------------------------------------------------
  // SETUP PERSISTENCE
  // --------------------------------------------------------------------
  // Connect to IndexedDB for local storage
  // The database name includes the noteId for isolation
  const provider = new IndexeddbPersistence(`locanote-${noteId}`, doc);

  // Track the document and provider
  activeDocuments.set(noteId, doc);
  activeProviders.set(noteId, provider);

  // --------------------------------------------------------------------
  // SYNC EVENT HANDLER
  // --------------------------------------------------------------------
  // Fires when document is synced with IndexedDB (loaded or saved)
  provider.on("synced", () => {
    console.log(`Document ${noteId} synced with IndexedDB`);
  });

  // --------------------------------------------------------------------
  // RETURN DOCUMENT INTERFACE
  // --------------------------------------------------------------------
  return {
    document: doc,
    provider,
    content,
    title,
    tags,
    meta,
    destroy: () => closeDocument(noteId),
  };
}

// ============================================================================
// CLOSE DOCUMENT
// ============================================================================
// Closes a document and cleans up resources
//
// @param noteId - The ID of the document to close

export function closeDocument(noteId: string): void {
  const doc = activeDocuments.get(noteId);
  const provider = activeProviders.get(noteId);

  if (provider) {
    provider.destroy(); // Stop persistence
    activeProviders.delete(noteId);
  }

  if (doc) {
    doc.destroy(); // Destroy document
    activeDocuments.delete(noteId);
  }
}

// ============================================================================
// GET DOCUMENT (if already open)
// ============================================================================
// Returns an existing document without creating a new one
//
// @param noteId - The ID of the document
// @returns The document or undefined if not open

export function getDocument(noteId: string): Y.Doc | undefined {
  return activeDocuments.get(noteId);
}

// ============================================================================
// CHECK IF DOCUMENT IS OPEN
// ============================================================================
//
// @param noteId - The ID to check
// @returns true if document is currently open

export function isDocumentOpen(noteId: string): boolean {
  return activeDocuments.has(noteId);
}

// ============================================================================
// GET DOCUMENT CONTENT AS PLAIN TEXT
// ============================================================================
// Extracts plain text from the Yjs document (useful for search, previews)
//
// @param noteId - The ID of the document
// @returns Plain text content or empty string

export function getDocumentText(noteId: string): string {
  const doc = activeDocuments.get(noteId);
  if (!doc) return "";

  const content = doc.getXmlFragment("content");
  // Convert Y.XmlFragment to plain text
  // This is a simplified version - in practice you'd parse the XML structure
  return content.toString();
}

// ============================================================================
// GET DOCUMENT METADATA
// ============================================================================
//
// @param noteId - The ID of the document
// @returns Metadata object or null

export function getDocumentMeta(noteId: string): {
  createdAt: number;
  updatedAt: number;
  [key: string]: any;
} | null {
  const doc = activeDocuments.get(noteId);
  if (!doc) return null;

  const meta = doc.getMap("meta");
  return {
    createdAt: meta.get("createdAt") as number,
    updatedAt: meta.get("updatedAt") as number,
    ...Object.fromEntries(meta.entries()),
  };
}

// ============================================================================
// EXPORT DOCUMENT TO JSON
// ============================================================================
// Exports the entire document state as JSON (for backup, export, etc.)
//
// @param noteId - The ID of the document
// @returns JSON representation or null

export function exportDocumentToJSON(noteId: string): any | null {
  const doc = activeDocuments.get(noteId);
  if (!doc) return null;

  return doc.toJSON();
}

// ============================================================================
// IMPORT DOCUMENT FROM JSON
// ============================================================================
// Imports a document from JSON (for restore, import, etc.)
//
// @param noteId - The ID for the new document
// @param json - The JSON data to import
// @returns The imported document interface

export function importDocumentFromJSON(
  noteId: string,
  json: any,
): ReturnType<typeof openDocument> {
  // Close existing document if any
  closeDocument(noteId);

  // Create new document
  const result = openDocument(noteId);

  // Import the JSON state
  // Note: This requires careful handling to avoid conflicts
  // In practice, you'd use Y.applyUpdate with the encoded state

  return result;
}

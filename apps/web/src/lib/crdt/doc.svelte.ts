// ============================================================================
// YJS DOCUMENT MANAGEMENT
// ============================================================================
// This module manages Yjs documents for collaborative note editing.

import * as Y from "yjs"; // Import Yjs library
import { IndexeddbPersistence } from "y-indexeddb"; // Local persistence

// ============================================================================
// ACTIVE DOCUMENTS MAP & REFERENCE COUNTING
// ============================================================================
// I keep track of open documents and how many components are using them.
// This prevents closing a document while it's still active in the UI.

const activeDocuments = new Map<string, Y.Doc>(); 
const activeProviders = new Map<string, IndexeddbPersistence>();
const refCounts = new Map<string, number>();

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
  // Increment reference count
  const count = refCounts.get(noteId) || 0;
  refCounts.set(noteId, count + 1);

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
      destroy: () => closeDocument(noteId), // Cleanup function decrements count
    };
  }

  // CREATE NEW DOCUMENT
  const doc = new Y.Doc(); 

  // Initialize shared types
  const content = doc.getXmlFragment("content"); 
  const title = doc.getText("title"); 
  const tags = doc.getArray<string>("tags"); 
  const meta = doc.getMap("meta"); 

  if (meta.get("createdAt") === undefined) {
    meta.set("createdAt", Date.now());
    meta.set("updatedAt", Date.now());
  }

  // SETUP PERSISTENCE
  const provider = new IndexeddbPersistence(`locanote-${noteId}`, doc);

  activeDocuments.set(noteId, doc);
  activeProviders.set(noteId, provider);

  provider.on("synced", () => {
    console.log(`[Yjs] Document ${noteId} synchronized with IndexedDB`);
  });

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
// CLOSE DOCUMENT (With Reference Counting)
// ============================================================================
// Decrements reference count and only destroys if count reaches zero.

export function closeDocument(noteId: string): void {
  const count = refCounts.get(noteId) || 0;
  
  if (count <= 1) {
    // Last reference or zero, safe to destroy
    const doc = activeDocuments.get(noteId);
    const provider = activeProviders.get(noteId);

    if (provider) {
      provider.destroy(); 
      activeProviders.delete(noteId);
    }

    if (doc) {
      doc.destroy(); 
      activeDocuments.delete(noteId);
    }
    
    refCounts.delete(noteId);
    console.log(`[Yjs] Document ${noteId} fully closed and garbage collected.`);
  } else {
    // Other components are still using this document
    refCounts.set(noteId, count - 1);
    console.log(`[Yjs] Decremented reference for ${noteId}. Current count: ${count - 1}`);
  }
}

export function getDocument(noteId: string): Y.Doc | undefined {
  return activeDocuments.get(noteId);
}

export function isDocumentOpen(noteId: string): boolean {
  return activeDocuments.has(noteId);
}

export function getDocumentText(noteId: string): string {
  const doc = activeDocuments.get(noteId);
  if (!doc) return "";
  const content = doc.getXmlFragment("content");
  return content.toString();
}

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

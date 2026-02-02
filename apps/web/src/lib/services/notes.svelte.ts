// ============================================================================
// NOTE SERVICE
// ============================================================================
// This module handles all note operations: create, read, update, delete.
// It combines IndexedDB (for metadata) with Yjs (for content).
//
// ARCHITECTURE:
// - Note metadata (title, tags, timestamps) → IndexedDB
// - Note content (rich text) → Yjs document (separate IndexedDB)
// - User ID links everything together
//
// FLOW:
// 1. Create note → Save metadata to IndexedDB, create Yjs doc
// 2. Read note → Get metadata from IndexedDB, open Yjs doc
// 3. Update note → Update metadata in IndexedDB (Yjs auto-saves content)
// 4. Delete note → Delete from IndexedDB, destroy Yjs doc
// ============================================================================

import {
  createNote,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote,
  searchNotes,
} from "$db/notes";
import { openDocument, closeDocument } from "$crdt/doc.svelte";
import type { Note } from "$db";
import { auth } from "$stores/auth.svelte";

// ============================================================================
// BROWSER ENVIRONMENT CHECK
// ============================================================================
// Note operations require browser-only APIs like crypto.randomUUID

const isBrowser =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).window !== "undefined" &&
  typeof (globalThis as any).crypto !== "undefined";

/**
 * Generate a unique ID for notes
 * Uses crypto.randomUUID in browser, fallback in SSR
 */
function generateNoteId(): string {
  if (!isBrowser) {
    // Fallback for SSR - generate a pseudo-random ID
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
    return `note-${uuid}`;
  }

  return `note-${(globalThis as any).crypto.randomUUID()}`;
}

// ============================================================================
// CREATE NEW NOTE
// ============================================================================
// Creates a new note for the current user
//
// @param title - Initial note title
// @param initialTags - Optional array of tag IDs
// @returns The created note object

export async function createNewNote(
  title: string = "Untitled Note",
  initialTags: string[] = [],
): Promise<Note> {
  const session = auth.session;
  if (!session) {
    throw new Error("User not authenticated");
  }

  const now = Date.now();
  const noteId = generateNoteId();

  // 1. Create metadata in IndexedDB
  const note = await createNote({
    id: noteId,
    userId: session.userId,
    title,
    tags: initialTags,
    createdAt: now,
    updatedAt: now,
    yjsDocId: noteId,
  });

  // Note: Yjs document will be created automatically when user opens the note
  // We don't create it here to avoid race conditions with IndexedDB persistence

  return note;
}

// ============================================================================
// GET USER NOTES
// ============================================================================
// Gets all notes for the current user, sorted by updated date
//
// @returns Array of notes

export async function getUserNotes(): Promise<Note[]> {
  const session = auth.session;
  if (!session) {
    return [];
  }

  return getNotesByUser(session.userId);
}

// ============================================================================
// GET SINGLE NOTE
// ============================================================================
// Gets a specific note by ID
//
// @param noteId - The note ID
// @returns Note or undefined if not found

export async function getNote(noteId: string): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) {
    return undefined;
  }

  const note = await getNoteById(noteId);

  // Verify ownership
  if (note && note.userId !== session.userId) {
    return undefined;
  }

  return note;
}

// ============================================================================
// UPDATE NOTE TITLE
// ============================================================================
// Updates just the title of a note
//
// @param noteId - The note ID
// @param newTitle - New title
// @returns Updated note or undefined

export async function updateNoteTitle(
  noteId: string,
  newTitle: string,
): Promise<Note | undefined> {
  const note = await getNote(noteId);
  if (!note) return undefined;

  note.title = newTitle;
  note.updatedAt = Date.now();

  // Also update in Yjs
  const docInfo = openDocument(noteId);
  const currentTitle = docInfo.title.toString();

  if (currentTitle !== newTitle) {
    docInfo.title.delete(0, currentTitle.length);
    docInfo.title.insert(0, newTitle);
  }

  docInfo.destroy();

  return updateNote(note);
}

// ============================================================================
// UPDATE NOTE TAGS
// ============================================================================
// Updates the tags of a note
//
// @param noteId - The note ID
// @param newTags - New array of tag IDs
// @returns Updated note or undefined

export async function updateNoteTags(
  noteId: string,
  newTags: string[],
): Promise<Note | undefined> {
  const note = await getNote(noteId);
  if (!note) return undefined;

  note.tags = newTags;
  note.updatedAt = Date.now();

  // Update in Yjs
  const docInfo = openDocument(noteId);
  docInfo.tags.delete(0, docInfo.tags.length);
  newTags.forEach((tag) => docInfo.tags.push([tag]));
  docInfo.destroy();

  return updateNote(note);
}

// ============================================================================
// DELETE NOTE
// ============================================================================
// Deletes a note and its Yjs document
//
// @param noteId - The note ID to delete
// @returns true if deleted, false if not found

export async function deleteUserNote(noteId: string): Promise<boolean> {
  const note = await getNote(noteId);
  if (!note) return false;

  // 1. Delete metadata from IndexedDB
  await deleteNote(noteId);

  // 2. Close and cleanup Yjs document
  closeDocument(noteId);

  return true;
}

// ============================================================================
// SEARCH NOTES
// ============================================================================
// Searches user's notes by title
//
// @param query - Search string
// @returns Matching notes

export async function searchUserNotes(query: string): Promise<Note[]> {
  const session = auth.session;
  if (!session) {
    return [];
  }

  return searchNotes(session.userId, query);
}

// ============================================================================
// GET NOTES BY TAG
// ============================================================================
// Gets all notes that have a specific tag
//
// @param tagId - The tag ID
// @returns Notes with that tag

export async function getNotesByTagId(tagId: string): Promise<Note[]> {
  const session = auth.session;
  if (!session) {
    return [];
  }

  const allNotes = await getNotesByUser(session.userId);
  return allNotes.filter((note) => note.tags.includes(tagId));
}

// ============================================================================
// DUPLICATE NOTE
// ============================================================================
// Creates a copy of an existing note
//
// @param noteId - The note to duplicate
// @returns The new note or undefined

export async function duplicateNote(noteId: string): Promise<Note | undefined> {
  const original = await getNote(noteId);
  if (!original) return undefined;

  const newTitle = `${original.title} (Copy)`;
  const newNote = await createNewNote(newTitle, [...original.tags]);

  // Copy content from Yjs
  const originalDoc = openDocument(noteId);
  const newDoc = openDocument(newNote.id);

  // Copy title
  const titleText = originalDoc.title.toString();
  newDoc.title.delete(0, newDoc.title.toString().length);
  newDoc.title.insert(0, titleText);

  // Note: Content copying would need deeper Yjs manipulation
  // For now, we just copy the metadata

  originalDoc.destroy();
  newDoc.destroy();

  return newNote;
}

// ============================================================================
// JOIN SHARED NOTE
// ============================================================================
// Allows a user to join a note shared via URL. Creates a local reference
// to the note with the same yjsDocId, enabling real-time collaboration.
//
// @param noteId - The shared note ID (from URL)
// @param title - Optional title (default: "Shared Note")
// @returns The joined note or undefined if not authenticated

export async function joinSharedNote(
  noteId: string,
  title: string = "Shared Note",
): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) {
    return undefined;
  }

  // Check if user already has this note
  const existingNote = await getNoteById(noteId);
  if (existingNote) {
    // If it's already the user's note, return it
    if (existingNote.userId === session.userId) {
      return existingNote;
    }
    // Note exists but belongs to another user - this is a shared note scenario
    // For collaboration, we use the same Yjs document ID
  }

  const now = Date.now();

  // Create a local reference to the shared note
  // The key is using the SAME noteId as yjsDocId so Yjs syncs with the original
  const note = await createNote({
    id: noteId, // Use the same ID to reference the shared note
    userId: session.userId,
    title,
    tags: [],
    createdAt: now,
    updatedAt: now,
    yjsDocId: noteId, // Same as the original - enables Yjs sync
  });

  return note;
}

// ============================================================================
// GET NOTE (WITH SHARED ACCESS)
// ============================================================================
// Gets a note, allowing access for collaboration (shared notes)
//
// @param noteId - The note ID
// @param allowSharedAccess - If true, returns the note even if not the owner
// @returns Note or undefined

export async function getNoteForCollaboration(
  noteId: string,
): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) {
    return undefined;
  }

  const note = await getNoteById(noteId);

  // If note exists and belongs to current user, return it
  if (note && note.userId === session.userId) {
    return note;
  }

  // If note doesn't exist locally, this might be a shared note
  // Create a local reference for collaboration
  if (!note) {
    return joinSharedNote(noteId);
  }

  return undefined;
}

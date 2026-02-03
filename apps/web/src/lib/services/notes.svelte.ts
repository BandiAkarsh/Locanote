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
import { deriveKeyFromPassword, storeRoomKey } from "$crypto/e2e";
import { uint8ArrayToBase64, isBrowser } from "$utils/browser";

/**
 * Generate a unique ID for notes
 */
function generateNoteId(): string {
  if (!isBrowser) {
    return `note-${Math.random().toString(36).slice(2, 11)}`;
  }
  return `note-${(globalThis as any).crypto.randomUUID()}`;
}

// ============================================================================
// CORE OPERATIONS
// ============================================================================

export async function createNewNote(
  title: string = "Untitled Note",
  initialTags: string[] = [],
): Promise<Note> {
  const session = auth.session;
  if (!session) throw new Error("User not authenticated");

  const now = Date.now();
  const noteId = generateNoteId();

  return await createNote({
    id: noteId,
    userId: session.userId,
    title,
    tags: initialTags,
    createdAt: now,
    updatedAt: now,
    yjsDocId: noteId,
  });
}

export async function getUserNotes(): Promise<Note[]> {
  const session = auth.session;
  if (!session) return [];
  return getNotesByUser(session.userId);
}

export async function getNote(noteId: string): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) return undefined;

  const note = await getNoteById(noteId);
  if (note && note.userId !== session.userId) return undefined;

  return note;
}

export async function updateNoteTitle(
  noteId: string,
  newTitle: string,
): Promise<Note | undefined> {
  const note = await getNote(noteId);
  if (!note) return undefined;

  note.title = newTitle;
  note.updatedAt = Date.now();

  const docInfo = openDocument(noteId);
  const currentTitle = docInfo.title.toString();

  if (currentTitle !== newTitle) {
    docInfo.title.delete(0, currentTitle.length);
    docInfo.title.insert(0, newTitle);
  }

  docInfo.destroy();
  return updateNote(note);
}

export async function updateNoteTags(
  noteId: string,
  newTags: string[],
): Promise<Note | undefined> {
  const note = await getNote(noteId);
  if (!note) return undefined;

  note.tags = newTags;
  note.updatedAt = Date.now();

  const docInfo = openDocument(noteId);
  docInfo.tags.delete(0, docInfo.tags.length);
  newTags.forEach((tag) => docInfo.tags.push([tag]));
  docInfo.destroy();

  return updateNote(note);
}

export async function deleteUserNote(noteId: string): Promise<boolean> {
  const note = await getNote(noteId);
  if (!note) return false;

  await deleteNote(noteId);
  closeDocument(noteId);
  return true;
}

// ============================================================================
// SECURITY & SHARING
// ============================================================================

/**
 * Sets or removes password protection for a note
 */
export async function protectNote(
  noteId: string,
  password?: string,
): Promise<Note | undefined> {
  const note = await getNote(noteId);
  if (!note) return undefined;

  if (password) {
    const { key, salt } = deriveKeyFromPassword(password);
    note.isProtected = true;
    note.passwordSalt = uint8ArrayToBase64(salt);
    storeRoomKey(noteId, key);
  } else {
    note.isProtected = false;
    note.passwordSalt = undefined;
  }

  return updateNote(note);
}

/**
 * Allows a user to join a note shared via URL
 */
export async function joinSharedNote(
  noteId: string,
  title: string = "Shared Note",
): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) return undefined;

  const existingNote = await getNoteById(noteId);
  if (existingNote) {
    if (existingNote.userId === session.userId) return existingNote;
  }

  const now = Date.now();
  return await createNote({
    id: noteId,
    userId: session.userId,
    title,
    tags: [],
    createdAt: now,
    updatedAt: now,
    yjsDocId: noteId,
  });
}

/**
 * Gets a note, allowing access for collaboration
 */
export async function getNoteForCollaboration(
  noteId: string,
): Promise<Note | undefined> {
  const session = auth.session;
  if (!session) return undefined;

  const note = await getNoteById(noteId);
  if (note && note.userId === session.userId) return note;

  if (!note) {
    return joinSharedNote(noteId);
  }

  return undefined;
}

// ============================================================================
// UTILITIES
// ============================================================================

export async function searchUserNotes(query: string): Promise<Note[]> {
  const session = auth.session;
  if (!session) return [];
  return searchNotes(session.userId, query);
}

export async function getNotesByTagId(tagId: string): Promise<Note[]> {
  const session = auth.session;
  if (!session) return [];
  const allNotes = await getNotesByUser(session.userId);
  return allNotes.filter((note) => note.tags.includes(tagId));
}

export async function duplicateNote(noteId: string): Promise<Note | undefined> {
  const original = await getNote(noteId);
  if (!original) return undefined;

  const newTitle = `${original.title} (Copy)`;
  const newNote = await createNewNote(newTitle, [...original.tags]);

  const originalDoc = openDocument(noteId);
  const newDoc = openDocument(newNote.id);

  const titleText = originalDoc.title.toString();
  newDoc.title.delete(0, newDoc.title.toString().length);
  newDoc.title.insert(0, titleText);

  originalDoc.destroy();
  newDoc.destroy();

  return newNote;
}

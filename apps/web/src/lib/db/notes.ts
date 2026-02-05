// ============================================================================
// NOTES DATABASE OPERATIONS
// ============================================================================
// Helper functions for note metadata (not the actual content).
// Note content is stored by Yjs - this is just metadata.
//
// WHAT'S STORED HERE:
// - id, userId, title, tags, timestamps, yjsDocId
//
// WHAT'S NOT STORED HERE:
// - Actual note text/content (that's in Yjs IndexedDB)
// ============================================================================

import { getDB } from "./index"; // Import database getter
import type { Note } from "./index"; // Import Note type

// ============================================================================
// CREATE NOTE
// ============================================================================
// Adds a new note to the database
//
// @param note - The note object to add
// @returns The added note

export async function createNote(note: Note): Promise<Note> {
  const db = await getDB();
  await db.add("notes", note); // Add to 'notes' store
  return note;
}

// ============================================================================
// GET NOTE BY ID
// ============================================================================
// Retrieves a note by its unique ID
//
// @param id - The note's unique ID
// @returns The note, or undefined if not found

export async function getNoteById(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get("notes", id);
}

// ============================================================================
// GET NOTES BY USER
// ============================================================================
// Gets all notes belonging to a user
//
// @param userId - The user's ID
// @returns Array of notes (sorted by updatedAt, newest first)

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const db = await getDB();
  const index = db.transaction("notes").store.index("by-user");
  const notes = await index.getAll(userId); // Get all notes for user

  // Sort by updatedAt (newest first)
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

// ============================================================================
// GET NOTES BY TAG
// ============================================================================
// Gets all notes that have a specific tag
//
// @param tagId - The tag's ID
// @returns Array of notes

export async function getNotesByTag(tagId: string): Promise<Note[]> {
  const db = await getDB();
  const index = db.transaction("notes").store.index("by-tag");
  return index.getAll(tagId); // Get all notes with this tag
}

// ============================================================================
// UPDATE NOTE
// ============================================================================
// Updates an existing note
// Automatically updates the updatedAt timestamp
//
// @param note - The note object with updated data
// @returns The updated note

export async function updateNote(note: Note): Promise<Note> {
  const db = await getDB();
  note.updatedAt = Date.now(); // Update timestamp
  await db.put("notes", note); // Save changes
  return note;
}

// ============================================================================
// DELETE NOTE
// ============================================================================
// Removes a note from the database
// Note: This only deletes the metadata! The Yjs document still exists.
// You'll need to separately delete the Yjs document if desired.
//
// @param noteId - The ID of note to delete

export async function deleteNote(noteId: string): Promise<void> {
  const db = await getDB();
  await db.delete("notes", noteId);
}

// ============================================================================
// DELETE ALL NOTES FOR USER
// ============================================================================
// Removes all notes belonging to a user
// Called when deleting a user account
//
// @param userId - The user's ID

export async function deleteNotesByUser(userId: string): Promise<void> {
  const db = await getDB();
  const notes = await getNotesByUser(userId); // Get all user notes

  // Delete each one
  const tx = db.transaction("notes", "readwrite");
  for (const note of notes) {
    await tx.store.delete(note.id);
  }
  await tx.done;
}

// ============================================================================
// SEARCH NOTES
// ============================================================================
// Simple text search in note titles
// For full-text search of note content, you'd need a more complex solution
//
// @param userId - The user's ID
// @param query - Search string
// @returns Array of matching notes

export async function searchNotes(
  userId: string,
  query: string,
): Promise<Note[]> {
  const notes = await getNotesByUser(userId); // Get all user notes
  const lowerQuery = query.toLowerCase(); // Case-insensitive search

  return notes.filter(
    (note) => note.title.toLowerCase().includes(lowerQuery), // Check if title matches
  );
}

// ============================================================================
// COUNT NOTES
// ============================================================================
// Gets the total number of notes for a user
//
// @param userId - The user's ID
// @returns Number of notes

export async function countNotes(userId: string): Promise<number> {
  const notes = await getNotesByUser(userId);
  return notes.length;
}

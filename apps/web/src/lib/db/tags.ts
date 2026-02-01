// ============================================================================
// TAGS DATABASE OPERATIONS
// ============================================================================
// Helper functions for managing tags (labels for organizing notes).
// Tags are like folders but more flexible - a note can have multiple tags.
//
// EXAMPLE TAGS:
// - "work", "personal", "ideas", "todo", "javascript", "recipes"
//
// COLORS:
// Each tag has a color for visual identification in the UI.
// ============================================================================

import { getDB } from './index';                                // Import database getter
import type { Tag } from './index';                             // Import Tag type

// ============================================================================
// CREATE TAG
// ============================================================================
// Adds a new tag to the database
//
// @param tag - The tag object to add
// @returns The added tag

export async function createTag(tag: Tag): Promise<Tag> {
  const db = await getDB();
  await db.add('tags', tag);                                     // Add to 'tags' store
  return tag;
}

// ============================================================================
// GET TAG BY ID
// ============================================================================
// Retrieves a tag by its unique ID
//
// @param id - The tag's unique ID
// @returns The tag, or undefined if not found

export async function getTagById(id: string): Promise<Tag | undefined> {
  const db = await getDB();
  return db.get('tags', id);
}

// ============================================================================
// GET TAGS BY USER
// ============================================================================
// Gets all tags belonging to a user
//
// @param userId - The user's ID
// @returns Array of tags

export async function getTagsByUser(userId: string): Promise<Tag[]> {
  const db = await getDB();
  const index = db.transaction('tags').store.index('by-user');
  return index.getAll(userId);                                   // Get all tags for user
}

// ============================================================================
// GET TAG BY NAME
// ============================================================================
// Finds a tag by its name (case-insensitive)
// Useful to check if a tag already exists
//
// @param userId - The user's ID
// @param name - The tag name to search for
// @returns The tag, or undefined if not found

export async function getTagByName(userId: string, name: string): Promise<Tag | undefined> {
  const tags = await getTagsByUser(userId);                      // Get all user tags
  const lowerName = name.toLowerCase();
  return tags.find(tag => tag.name.toLowerCase() === lowerName);
}

// ============================================================================
// UPDATE TAG
// ============================================================================
// Updates an existing tag (name or color)
//
// @param tag - The tag object with updated data
// @returns The updated tag

export async function updateTag(tag: Tag): Promise<Tag> {
  const db = await getDB();
  await db.put('tags', tag);                                     // Save changes
  return tag;
}

// ============================================================================
// DELETE TAG
// ============================================================================
// Removes a tag from the database
// Note: This doesn't remove the tag from notes! You should update notes
// to remove references to this tag before deleting it.
//
// @param tagId - The ID of tag to delete

export async function deleteTag(tagId: string): Promise<void> {
  const db = await getDB();
  await db.delete('tags', tagId);
}

// ============================================================================
// DELETE ALL TAGS FOR USER
// ============================================================================
// Removes all tags belonging to a user
// Called when deleting a user account
//
// @param userId - The user's ID

export async function deleteTagsByUser(userId: string): Promise<void> {
  const db = await getDB();
  const tags = await getTagsByUser(userId);                      // Get all user tags

  // Delete each one
  const tx = db.transaction('tags', 'readwrite');
  for (const tag of tags) {
    await tx.store.delete(tag.id);
  }
  await tx.done;
}

// ============================================================================
// CHECK IF TAG EXISTS
// ============================================================================
// Returns true if a tag with this name already exists for the user
//
// @param userId - The user's ID
// @param name - The tag name to check
// @returns True if tag exists

export async function tagExists(userId: string, name: string): Promise<boolean> {
  const tag = await getTagByName(userId, name);                  // Try to find tag
  return !!tag;                                                  // Convert to boolean
}

// ============================================================================
// DEFAULT TAG COLORS
// ============================================================================
// A palette of nice colors for tags

export const TAG_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

// ============================================================================
// GET RANDOM TAG COLOR
// ============================================================================
// Returns a random color from the palette

export function getRandomTagColor(): string {
  const index = Math.floor(Math.random() * TAG_COLORS.length);   // Pick random index
  return TAG_COLORS[index];                                      // Return color at index
}

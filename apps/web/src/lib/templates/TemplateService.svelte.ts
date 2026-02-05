// ============================================================================
// TEMPLATE SERVICE
// ============================================================================
// Business logic for creating notes from templates

import { createNewNote, getUserNotes } from "$lib/services/notes.svelte";
import {
  allTemplates,
  getTemplateById,
  getTemplatesByCategory,
} from "./templates-data";
import type { NoteTemplate, TemplateCategory, TemplateFilter } from "./types";
import type { Note } from "$db";

/**
 * Get all available templates
 */
export function getAllTemplates(): NoteTemplate[] {
  return allTemplates;
}

/**
 * Get templates filtered by category
 */
export function getTemplates(category?: TemplateCategory): NoteTemplate[] {
  return getTemplatesByCategory(category || "all");
}

/**
 * Find template by ID
 */
export function findTemplate(id: string): NoteTemplate | undefined {
  return getTemplateById(id);
}

/**
 * Filter templates by search query
 */
export function filterTemplates(
  templates: NoteTemplate[],
  filter: TemplateFilter,
): NoteTemplate[] {
  let filtered = [...templates];

  // Filter by category
  if (filter.category && filter.category !== "all") {
    filtered = filtered.filter((t) => t.category === filter.category);
  }

  // Filter by search query
  if (filter.search) {
    const query = filter.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.defaultTags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  return filtered;
}

/**
 * Create a new note from a template
 * Returns both the note and the template content for the editor to use
 */
export async function createNoteFromTemplate(
  templateId: string,
  customTitle?: string,
): Promise<{ note: Note | null; templateContent: any | null }> {
  const template = getTemplateById(templateId);

  if (!template) {
    console.error(`[TemplateService] Template not found: ${templateId}`);
    return { note: null, templateContent: null };
  }

  try {
    // Use custom title if provided, otherwise use template default
    const title = customTitle?.trim() || template.defaultTitle;

    // Create the note with template tags
    const note = await createNewNote(title, template.defaultTags);

    if (!note) {
      return { note: null, templateContent: null };
    }

    console.log(
      `[TemplateService] Created note from template: ${template.name}`,
    );

    // Return the note AND the template content
    // The editor will use this content as initial content
    return {
      note,
      templateContent: template.content,
    };
  } catch (error) {
    console.error(
      "[TemplateService] Failed to create note from template:",
      error,
    );
    return { note: null, templateContent: null };
  }
}

/**
 * Get template content by ID
 * Used when we need to load template content separately
 */
export function getTemplateContent(templateId: string): any | null {
  const template = getTemplateById(templateId);
  return template?.content || null;
}

/**
 * Get template categories for filtering UI
 */
export function getTemplateCategories(): Array<{
  id: TemplateCategory;
  name: string;
  count: number;
}> {
  const categories: TemplateCategory[] = [
    "all",
    "work",
    "personal",
    "creative",
    "education",
  ];

  return categories.map((cat) => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count:
      cat === "all"
        ? allTemplates.length
        : allTemplates.filter((t) => t.category === cat).length,
  }));
}

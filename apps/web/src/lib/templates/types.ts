// ============================================================================
// TEMPLATE TYPES
// ============================================================================
// TypeScript interfaces for note templates

/**
 * Represents a single template structure
 */
export interface NoteTemplate {
  /** Unique identifier for the template */
  id: string;

  /** Display name */
  name: string;

  /** Short description */
  description: string;

  /** Icon identifier (Lucide icon name) */
  icon: string;

  /** Default title for notes created from this template */
  defaultTitle: string;

  /** Tags to auto-apply */
  defaultTags: string[];

  /** Template content as TipTap JSON structure */
  content: TemplateContent;

  /** Category for grouping */
  category: "personal" | "work" | "creative" | "education";

  /** Color accent for visual distinction */
  color: string;
}

/**
 * Recursive TipTap-compatible content structure
 */
export interface TemplateContentNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  attrs?: Record<string, any>;
  content?: TemplateContentNode[];
}

/**
 * TipTap-compatible content structure
 */
export interface TemplateContent {
  type: "doc";
  content: TemplateContentNode[];
}

/**
 * Template category for filtering/grouping
 */
export type TemplateCategory =
  | "all"
  | "personal"
  | "work"
  | "creative"
  | "education";

/**
 * Template filter options
 */
export interface TemplateFilter {
  category?: TemplateCategory;
  search?: string;
}

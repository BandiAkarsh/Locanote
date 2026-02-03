// ============================================================================
// SEARCH SERVICE
// ============================================================================
// Full-text search across notes with filtering capabilities

import { getUserNotes } from './notes.svelte';
import { openDocument } from '$crdt/doc.svelte';
import type { Note } from '$db';

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
}

export interface SearchResult {
  note: Note;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Search through all user notes
 * Searches in titles, tags, and content
 */
export async function searchNotes(filters: SearchFilters): Promise<SearchResult[]> {
  const allNotes = await getUserNotes();
  
  if (!filters.query && !filters.tags?.length && !filters.dateFrom && !filters.dateTo) {
    // No filters applied, return all notes sorted by updated date
    return allNotes
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(note => ({ note, relevanceScore: 0, matchedFields: [] }));
  }
  
  const results: SearchResult[] = [];
  const searchQuery = filters.query?.toLowerCase().trim();
  
  for (const note of allNotes) {
    let score = 0;
    const matchedFields: string[] = [];
    
    // Check title match
    if (searchQuery) {
      const titleLower = note.title.toLowerCase();
      if (titleLower.includes(searchQuery)) {
        score += titleLower === searchQuery ? 100 : 50;
        matchedFields.push('title');
      }
    }
    
    // Check tags match
    if (filters.tags && filters.tags.length > 0) {
      const matchingTags = note.tags.filter(tag => 
        filters.tags!.includes(tag)
      );
      if (matchingTags.length > 0) {
        score += matchingTags.length * 30;
        matchedFields.push('tags');
      }
    }
    
    // Check date range
    if (filters.dateFrom || filters.dateTo) {
      const updatedAt = note.updatedAt;
      const inRange = 
        (!filters.dateFrom || updatedAt >= filters.dateFrom) &&
        (!filters.dateTo || updatedAt <= filters.dateTo);
      
      if (!inRange) {
        continue; // Skip notes outside date range
      }
    }
    
    // Search in content if query provided
    if (searchQuery && score < 100) {
      try {
        const contentScore = await searchNoteContent(note.id, searchQuery);
        if (contentScore > 0) {
          score += contentScore;
          matchedFields.push('content');
        }
      } catch (err) {
        console.warn(`[Search] Failed to search content for note ${note.id}:`, err);
      }
    }
    
    // Include note if it has any match
    if (score > 0 || (!searchQuery && matchedFields.length > 0) || 
        (filters.dateFrom || filters.dateTo)) {
      results.push({ note, relevanceScore: score, matchedFields });
    }
  }
  
  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Search within a note's Yjs content
 */
async function searchNoteContent(noteId: string, query: string): Promise<number> {
  try {
    const docInfo = openDocument(noteId);
    const ydoc = docInfo.document;
    
    // Get the XML fragment content
    const xmlContent = ydoc.getXmlFragment('content');
    let contentText = '';
    
    // Extract text from XML content recursively
    const extractText = (node: any): string => {
      if (!node) return '';
      
      // If it's a text node
      if (node.toString && typeof node.toString === 'function') {
        return node.toString();
      }
      
      // If it has content array
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join(' ');
      }
      
      // If it's a Yjs type with _content
      if (node._content && Array.isArray(node._content)) {
        return node._content.map(extractText).join(' ');
      }
      
      return '';
    };
    
    contentText = extractText(xmlContent).toLowerCase();
    docInfo.destroy();
    
    if (contentText.includes(query)) {
      // Calculate relevance based on frequency
      const regex = new RegExp(query, 'g');
      const matches = contentText.match(regex);
      return matches ? matches.length * 10 : 10;
    }
    
    return 0;
  } catch (error) {
    console.error(`[Search] Error searching note content ${noteId}:`, error);
    return 0;
  }
}

/**
 * Get all unique tags from user's notes
 */
export async function getAllTags(): Promise<string[]> {
  const notes = await getUserNotes();
  const tagsSet = new Set<string>();
  
  notes.forEach(note => {
    note.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
}

/**
 * Quick search - searches only titles and tags (faster)
 */
export async function quickSearch(query: string): Promise<Note[]> {
  if (!query.trim()) {
    return getUserNotes();
  }
  
  const allNotes = await getUserNotes();
  const searchLower = query.toLowerCase();
  
  return allNotes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchLower);
    const tagMatch = note.tags.some(tag => 
      tag.toLowerCase().includes(searchLower)
    );
    return titleMatch || tagMatch;
  });
}

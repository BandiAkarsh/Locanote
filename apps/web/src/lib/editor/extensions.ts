// ============================================================================
// TIPTAP EDITOR CONFIGURATION
// ============================================================================
// This file configures TipTap with all the extensions we need for our
// collaborative note-taking app.
//
// WHAT IS TIPTAP?
// TipTap is a headless editor framework - it provides the editing logic
// but NO UI. We build our own UI (toolbar, menus) separately.
//
// PROSEMIRROR FOUNDATION:
// TipTap is built on ProseMirror, a powerful document editing toolkit
// used by Dropbox Paper, Atlassian Confluence, and others.
//
// EXTENSIONS WE USE:
// - StarterKit: Basic formatting (bold, italic, headings, lists)
// - Collaboration: Yjs integration for real-time sync
// - CollaborationCursor: Shows other users' cursors
// - Placeholder: Hint text when editor is empty
// - Highlight: Text background colors
// - TaskList: Checkboxes and todo items
// - Typography: Smart quotes, proper dashes
//
// YJS INTEGRATION:
// The Collaboration extension connects TipTap to our Yjs document.
// This enables real-time collaborative editing.
// ============================================================================

import { Editor } from '@tiptap/core';                           // Core editor class
import StarterKit from '@tiptap/starter-kit';                    // Basic formatting
import Collaboration from '@tiptap/extension-collaboration';     // Yjs sync
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'; // User cursors
import Placeholder from '@tiptap/extension-placeholder';         // Empty state hint
import Highlight from '@tiptap/extension-highlight';             // Text highlighting
import TaskList from '@tiptap/extension-task-list';              // Todo lists
import TaskItem from '@tiptap/extension-task-item';              // Checkbox items
import Typography from '@tiptap/extension-typography';           // Smart punctuation
import * as Y from 'yjs';                                        // Yjs types

// ============================================================================
// CREATE EDITOR CONFIGURATION
// ============================================================================
// This function creates a TipTap editor instance with all our extensions
//
// @param element - DOM element to mount the editor
// @param ydoc - Yjs document for collaboration
// @param user - Current user info (for cursors)
// @returns Configured Editor instance

export function createEditor(
  element: HTMLElement,
  ydoc: Y.Doc,
  user: { name: string; color: string }
): Editor {
  return new Editor({
    // ------------------------------------------------------------------------
    // MOUNTING
    // ------------------------------------------------------------------------
    element: element,                                             // DOM mount point

    // ------------------------------------------------------------------------
    // EXTENSIONS
    // ------------------------------------------------------------------------
    // Extensions are loaded in order - order matters for some functionality
    extensions: [
      // Basic formatting (must come before collaboration)
      StarterKit.configure({
        // Disable history - Collaboration has its own undo/redo
        history: false,
        
        // Heading levels allowed
        heading: {
          levels: [1, 2, 3]
        }
      }),

      // Smart typography (curly quotes, em dashes, etc.)
      Typography,

      // Text highlighting/background colors
      Highlight.configure({
        multicolor: true                                           // Allow any color
      }),

      // Todo lists with checkboxes
      TaskList,
      TaskItem.configure({
        nested: true                                               // Allow nested todos
      }),

      // Empty state placeholder
      Placeholder.configure({
        placeholder: 'Start typing your note...',
        emptyEditorClass: 'is-empty'                               // CSS class when empty
      }),

      // Real-time collaboration with Yjs
      // TipTap Collaboration expects the Y.Doc and will use the 'content' field by default
      Collaboration.configure({
        document: ydoc                                              // Connect to Yjs document
      }),

      // Show other users' cursors
      CollaborationCursor.configure({
        provider: null,                                            // We'll set this separately
        user: user                                                 // Current user info
      })
    ],

    // ------------------------------------------------------------------------
    // CONTENT
    // ------------------------------------------------------------------------
    // Editor starts empty - content comes from Yjs
    content: '',

    // ------------------------------------------------------------------------
    // BEHAVIOR
    // ------------------------------------------------------------------------
    editable: true,                                               // Allow editing
    autofocus: false,                                             // Don't auto-focus
    injectCSS: false                                              // We handle our own CSS
  });
}

// ============================================================================
// UPDATE USER CURSOR
// ============================================================================
// Updates the cursor information when user changes
//
// @param editor - The TipTap editor instance
// @param user - New user info

export function updateUserCursor(
  editor: Editor,
  user: { name: string; color: string }
): void {
  // Update the collaboration cursor extension
  const collaborationCursor = editor.extensionManager.extensions.find(
    ext => ext.name === 'collaborationCursor'
  );
  
  if (collaborationCursor) {
    collaborationCursor.options.user = user;
  }
}

// ============================================================================
// DESTROY EDITOR
// ============================================================================
// Properly cleanup an editor instance
//
// @param editor - Editor to destroy

export function destroyEditor(editor: Editor): void {
  editor.destroy();
}

// ============================================================================
// EDITOR SHORTCUTS
// ============================================================================
// Common keyboard shortcuts for the editor

export const EDITOR_SHORTCUTS = {
  // Formatting
  'Mod-b': 'bold',                                               // Cmd/Ctrl + B
  'Mod-i': 'italic',                                             // Cmd/Ctrl + I
  'Mod-u': 'underline',                                          // Cmd/Ctrl + U
  'Mod-Shift-x': 'strike',                                       // Cmd/Ctrl + Shift + X
  
  // Headings
  'Mod-Alt-1': 'heading',                                        // Cmd/Ctrl + Alt + 1
  'Mod-Alt-2': 'heading',                                        // Cmd/Ctrl + Alt + 2
  'Mod-Alt-3': 'heading',                                        // Cmd/Ctrl + Alt + 3
  
  // Lists
  'Mod-Shift-7': 'orderedList',                                  // Cmd/Ctrl + Shift + 7
  'Mod-Shift-8': 'bulletList',                                   // Cmd/Ctrl + Shift + 8
  'Mod-Shift-9': 'taskList',                                     // Cmd/Ctrl + Shift + 9
  
  // Other
  'Mod-z': 'undo',                                               // Cmd/Ctrl + Z
  'Mod-Shift-z': 'redo',                                         // Cmd/Ctrl + Shift + Z
  'Mod-Shift-.': 'blockquote',                                   // Cmd/Ctrl + Shift + >
  'Mod-e': 'code',                                               // Cmd/Ctrl + E
  'Mod-Shift-e': 'codeBlock'                                     // Cmd/Ctrl + Shift + E
};

// ============================================================================
// EDITOR STYLES
// ============================================================================
// CSS classes and styles for the editor

export const EDITOR_CLASSES = {
  // Editor wrapper
  editor: 'prose prose-lg max-w-none focus:outline-none',
  
  // Empty state
  empty: 'is-empty',
  
  // Collaboration cursor
  cursor: 'collaboration-cursor',
  
  // Placeholder
  placeholder: 'is-empty'
};

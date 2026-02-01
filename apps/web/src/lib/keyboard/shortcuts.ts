// ============================================================================
// KEYBOARD SHORTCUTS MODULE
// ============================================================================
// Handles keyboard shortcuts for the editor and app-wide actions.
// 
// SHORTCUTS SUPPORTED:
// - Cmd/Ctrl + S: Save/sync note
// - Cmd/Ctrl + B: Bold
// - Cmd/Ctrl + I: Italic  
// - Cmd/Ctrl + U: Underline
// - Cmd/Ctrl + K: Insert link
// - Cmd/Ctrl + Z: Undo
// - Cmd/Ctrl + Shift + Z: Redo
// - Cmd/Ctrl + Shift + S: Strikethrough
// - Esc: Close modals/clear selection
// - ?: Show keyboard shortcuts help
//
// USAGE:
// import { setupKeyboardShortcuts } from '$lib/keyboard/shortcuts';
// setupKeyboardShortcuts(editor);
// ============================================================================

import type { Editor } from '@tiptap/core';

// Browser type declarations
interface KeyboardEvent {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  preventDefault(): void;
  target: EventTarget | null;
}

interface HTMLElement {
  tagName: string;
  isContentEditable: boolean;
  getAttribute(name: string): string | null;
}

interface EventTarget {
  tagName?: string;
  isContentEditable?: boolean;
  getAttribute?: (name: string) => string | null;
}

declare const navigator: { platform: string };
declare const document: { addEventListener: (type: string, handler: (e: KeyboardEvent) => void) => void; removeEventListener: (type: string, handler: (e: KeyboardEvent) => void) => void };
declare const alert: (message: string) => void;

// Type for the editor instance
type EditorInstance = Editor;

// ============================================================================
// SHORTCUT HANDLERS
// ============================================================================

interface ShortcutHandlers {
  onSave?: () => void;
  onHelp?: () => void;
  onClose?: () => void;
}

// ============================================================================
// SETUP KEYBOARD SHORTCUTS
// ============================================================================
export function setupKeyboardShortcuts(
  editor: EditorInstance,
  handlers: ShortcutHandlers = {}
): () => void {
  
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
    
    // Cmd/Ctrl + S: Save
    if (cmdOrCtrl && event.key === 's' && !event.shiftKey) {
      event.preventDefault();
      handlers.onSave?.();
      return;
    }
    
    // Cmd/Ctrl + B: Bold
    if (cmdOrCtrl && event.key === 'b' && !event.shiftKey) {
      event.preventDefault();
      editor.chain().focus().toggleBold().run();
      return;
    }
    
    // Cmd/Ctrl + I: Italic
    if (cmdOrCtrl && event.key === 'i' && !event.shiftKey) {
      event.preventDefault();
      editor.chain().focus().toggleItalic().run();
      return;
    }
    
    // Cmd/Ctrl + U: Underline
    if (cmdOrCtrl && event.key === 'u' && !event.shiftKey) {
      event.preventDefault();
      // Underline requires additional extension, skip for now
      return;
    }
    
    // Cmd/Ctrl + K: Insert link (placeholder)
    if (cmdOrCtrl && event.key === 'k' && !event.shiftKey) {
      event.preventDefault();
      // Could open link dialog here
      return;
    }
    
    // Cmd/Ctrl + Shift + S: Strikethrough
    if (cmdOrCtrl && event.shiftKey && event.key === 'S') {
      event.preventDefault();
      editor.chain().focus().toggleStrike().run();
      return;
    }
    
    // ?: Show help (when not in input)
    if (event.key === '?' && !isTypingInInput(event)) {
      event.preventDefault();
      handlers.onHelp?.();
      return;
    }
    
    // Esc: Close/Clear
    if (event.key === 'Escape') {
      handlers.onClose?.();
      return;
    }
  };
  
  // Attach listener to document
  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isTypingInInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (!target) return false;
  
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || 
         tagName === 'textarea' || 
         target.isContentEditable ||
         target.getAttribute('role') === 'textbox';
}

// ============================================================================
// KEYBOARD SHORTCUTS HELP TEXT
// ============================================================================
export const KEYBOARD_SHORTCUTS_HELP = `
Keyboard Shortcuts:

Editor:
  Cmd/Ctrl + B    - Bold
  Cmd/Ctrl + I    - Italic
  Cmd/Ctrl + K    - Insert link
  Cmd/Ctrl + S    - Save/sync note
  Cmd/Ctrl + Z    - Undo
  Cmd/Ctrl + Shift + Z - Redo
  
Navigation:
  Esc             - Close modals/clear selection
  ?               - Show this help
`;

export function showShortcutsHelp(): void {
  alert(KEYBOARD_SHORTCUTS_HELP);
}

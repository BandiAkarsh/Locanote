// ============================================================================
// EDITOR MODULE EXPORTS
// ============================================================================
// Central export point for rich text editor functionality.
//
// ARCHITECTURE:
// - types.ts: Abstract interfaces (EditorAdapter, DocumentContent)
// - tiptap-adapter.ts: TipTap implementation of EditorAdapter
// - extensions.ts: TipTap-specific extension configuration
// - Editor.svelte: Main editor component
// - Toolbar.svelte: Editor toolbar component
//
// TO SWAP EDITOR LIBRARY:
// 1. Create new adapter implementing EditorAdapter interface
// 2. Create new Svelte component wrapping the editor
// 3. Update this file to export new implementations
// ============================================================================

// ============================================================================
// TYPES (Abstract Interfaces)
// ============================================================================

export type {
  EditorAdapter,
  DocumentContent,
  DocumentNode,
  ContentMark,
  FormatType,
  HeadingLevel,
  EditorOptions,
  CollaborativeEditorOptions,
  EditorFactory,
} from "./types";

export { EditorError, EditorDestroyedError } from "./types";

// ============================================================================
// TIPTAP ADAPTER (Current Implementation)
// ============================================================================

export {
  TipTapEditorAdapter,
  createTipTapAdapter,
  wrapTipTapEditor,
} from "./tiptap-adapter";

// ============================================================================
// SVELTE COMPONENTS
// ============================================================================

export { default as Editor } from "./Editor.svelte";
export { default as Toolbar } from "./Toolbar.svelte";
export { default as IntentToolbar } from "./IntentToolbar.svelte";

// ============================================================================
// LEGACY API (For Backward Compatibility)
// ============================================================================
// These exports maintain compatibility with existing code.
// New code should prefer the EditorAdapter interface.

export {
  createEditor,
  destroyEditor,
  updateUserCursor,
  type CreateEditorOptions,
} from "./extensions";

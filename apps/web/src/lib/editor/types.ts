// ============================================================================
// EDITOR MODULE TYPES
// ============================================================================
// Abstract interfaces for the rich text editor.
// These types are implementation-agnostic - they don't reference TipTap
// directly, making the module easily replaceable.
//
// CURRENT IMPLEMENTATION: TipTap (ProseMirror-based)
//
// FUTURE IMPLEMENTATIONS COULD USE:
// - Lexical (Meta)
// - Plate (ProseMirror-based)
// - Slate
// - Quill
// - Monaco (for code-focused editors)
//
// TO SWAP EDITOR LIBRARY:
// 1. Implement EditorAdapter interface
// 2. Create new editor component
// 3. Update index.ts to export new implementations
// ============================================================================

// ============================================================================
// DOCUMENT CONTENT TYPES
// ============================================================================

/**
 * Represents a mark/formatting on text content.
 */
export interface ContentMark {
  type: string;
  attrs?: Record<string, unknown>;
}

/**
 * Represents a node in the document tree.
 * This is a generic structure that can represent any rich text content.
 */
export interface DocumentNode {
  type: string;
  content?: DocumentNode[];
  text?: string;
  marks?: ContentMark[];
  attrs?: Record<string, unknown>;
}

/**
 * Represents the full document content.
 * Serializable to JSON for storage/export.
 */
export interface DocumentContent {
  type: string;
  content?: DocumentNode[];
}

// ============================================================================
// FORMAT TYPES
// ============================================================================

/**
 * Supported formatting types.
 */
export type FormatType =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "highlight"
  | "link"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule";

/**
 * Heading levels.
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// ============================================================================
// EDITOR ADAPTER INTERFACE
// ============================================================================

/**
 * Abstract interface for a rich text editor.
 * Implementations wrap specific editor libraries (TipTap, Lexical, etc.)
 *
 * @example Usage:
 * ```typescript
 * const adapter = createTipTapAdapter(editor);
 *
 * // Get content
 * const content = adapter.getContent();
 * const text = adapter.getText();
 *
 * // Apply formatting
 * adapter.toggleBold();
 * adapter.toggleHeading(2);
 *
 * // Check state
 * if (adapter.isActive("bold")) { ... }
 *
 * // Subscribe to changes
 * const unsubscribe = adapter.onUpdate((content) => {
 *   console.log("Content changed:", content);
 * });
 * ```
 */
export interface EditorAdapter {
  // ---------------------------------------------------------------------------
  // Content Operations
  // ---------------------------------------------------------------------------

  /** Get the current document content as a structured object */
  getContent(): DocumentContent;

  /** Get the current content as plain text */
  getText(): string;

  /** Get the current content as HTML string */
  getHTML(): string;

  /** Set the document content */
  setContent(content: DocumentContent): void;

  /** Insert text at the current cursor position */
  insertText(text: string): void;

  /** Insert a node at the current cursor position */
  insertNode(node: DocumentNode): void;

  /** Clear all content */
  clearContent(): void;

  // ---------------------------------------------------------------------------
  // Formatting Operations
  // ---------------------------------------------------------------------------

  /** Toggle bold formatting */
  toggleBold(): void;

  /** Toggle italic formatting */
  toggleItalic(): void;

  /** Toggle strikethrough formatting */
  toggleStrike(): void;

  /** Toggle inline code formatting */
  toggleCode(): void;

  /** Toggle underline formatting */
  toggleUnderline(): void;

  /** Toggle highlight formatting */
  toggleHighlight(color?: string): void;

  /** Toggle heading at specified level */
  toggleHeading(level: HeadingLevel): void;

  /** Toggle bullet list */
  toggleBulletList(): void;

  /** Toggle ordered/numbered list */
  toggleOrderedList(): void;

  /** Toggle task/checkbox list */
  toggleTaskList(): void;

  /** Toggle blockquote */
  toggleBlockquote(): void;

  /** Toggle code block */
  toggleCodeBlock(): void;

  /** Insert horizontal rule */
  insertHorizontalRule(): void;

  /** Set a link on selected text */
  setLink(url: string): void;

  /** Remove link from selected text */
  unsetLink(): void;

  // ---------------------------------------------------------------------------
  // State Queries
  // ---------------------------------------------------------------------------

  /** Check if a format is active at the current selection */
  isActive(format: FormatType, attrs?: Record<string, unknown>): boolean;

  /** Check if undo is available */
  canUndo(): boolean;

  /** Check if redo is available */
  canRedo(): boolean;

  /** Check if the editor is currently empty */
  isEmpty(): boolean;

  /** Check if the editor is currently focused */
  isFocused(): boolean;

  /** Check if the editor is editable */
  isEditable(): boolean;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Undo the last action */
  undo(): void;

  /** Redo the last undone action */
  redo(): void;

  /** Focus the editor */
  focus(): void;

  /** Blur (unfocus) the editor */
  blur(): void;

  /** Set whether the editor is editable */
  setEditable(editable: boolean): void;

  // ---------------------------------------------------------------------------
  // Selection Operations
  // ---------------------------------------------------------------------------

  /** Select all content */
  selectAll(): void;

  /** Get the currently selected text */
  getSelectedText(): string;

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /** Subscribe to content updates */
  onUpdate(callback: (content: DocumentContent) => void): () => void;

  /** Subscribe to selection changes */
  onSelectionChange(callback: () => void): () => void;

  /** Subscribe to focus events */
  onFocus(callback: () => void): () => void;

  /** Subscribe to blur events */
  onBlur(callback: () => void): () => void;

  // ---------------------------------------------------------------------------
  // Raw Access (For Advanced Use Cases)
  // ---------------------------------------------------------------------------

  /** Get the raw underlying editor instance (opaque type) */
  getRawEditor(): unknown;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /** Destroy the editor and clean up resources */
  destroy(): void;
}

// ============================================================================
// EDITOR OPTIONS
// ============================================================================

/**
 * Options for creating an editor.
 */
export interface EditorOptions {
  /** Element to mount the editor to */
  element: HTMLElement;

  /** Initial content (optional) */
  content?: DocumentContent;

  /** Whether the editor is editable */
  editable?: boolean;

  /** Whether to autofocus on creation */
  autofocus?: boolean;

  /** Placeholder text for empty editor */
  placeholder?: string;

  /** Called when content changes */
  onUpdate?: (content: DocumentContent) => void;

  /** Called when editor is created */
  onCreate?: (adapter: EditorAdapter) => void;

  /** Called when editor is focused */
  onFocus?: () => void;

  /** Called when editor is blurred */
  onBlur?: () => void;
}

/**
 * Options for creating a collaborative editor.
 */
export interface CollaborativeEditorOptions extends EditorOptions {
  /** The collaborative document to sync with */
  document: unknown; // Raw CRDT document (Y.Doc, etc.)

  /** User presence info */
  user: {
    name: string;
    color: string;
    id: string;
  };

  /** Network provider for collaboration (optional) */
  provider?: unknown;
}

// ============================================================================
// EDITOR FACTORY INTERFACE
// ============================================================================

/**
 * Factory interface for creating editors.
 */
export interface EditorFactory {
  /** Create a standalone editor */
  create(options: EditorOptions): EditorAdapter;

  /** Create a collaborative editor */
  createCollaborative(options: CollaborativeEditorOptions): EditorAdapter;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error thrown when an editor operation fails.
 */
export class EditorError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "EditorError";
  }
}

/**
 * Error thrown when trying to use a destroyed editor.
 */
export class EditorDestroyedError extends Error {
  constructor() {
    super("Editor has been destroyed");
    this.name = "EditorDestroyedError";
  }
}

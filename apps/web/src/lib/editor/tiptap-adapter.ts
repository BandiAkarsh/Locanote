// ============================================================================
// TIPTAP EDITOR ADAPTER
// ============================================================================
// Implementation of EditorAdapter interface using TipTap.
// This wraps TipTap functionality in the abstract interface.
//
// TO SWAP EDITOR LIBRARY:
// 1. Create a new adapter file (e.g., lexical-adapter.ts)
// 2. Implement EditorAdapter interface
// 3. Update index.ts to export new implementation
// ============================================================================

import type { Editor as TipTapEditor, JSONContent } from "@tiptap/core";
import type {
  EditorAdapter,
  DocumentContent,
  DocumentNode,
  FormatType,
  HeadingLevel,
} from "./types";

// ============================================================================
// TIPTAP ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * TipTap implementation of EditorAdapter interface.
 */
export class TipTapEditorAdapter implements EditorAdapter {
  private destroyed = false;

  constructor(private readonly editor: TipTapEditor) {}

  // ---------------------------------------------------------------------------
  // Content Operations
  // ---------------------------------------------------------------------------

  getContent(): DocumentContent {
    this.checkDestroyed();
    return this.editor.getJSON() as DocumentContent;
  }

  getText(): string {
    this.checkDestroyed();
    return this.editor.getText();
  }

  getHTML(): string {
    this.checkDestroyed();
    return this.editor.getHTML();
  }

  setContent(content: DocumentContent): void {
    this.checkDestroyed();
    this.editor.commands.setContent(content as JSONContent);
  }

  insertText(text: string): void {
    this.checkDestroyed();
    this.editor.commands.insertContent(text);
  }

  insertNode(node: DocumentNode): void {
    this.checkDestroyed();
    this.editor.commands.insertContent(node as JSONContent);
  }

  clearContent(): void {
    this.checkDestroyed();
    this.editor.commands.clearContent();
  }

  // ---------------------------------------------------------------------------
  // Formatting Operations
  // ---------------------------------------------------------------------------

  toggleBold(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleStrike(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleStrike().run();
  }

  toggleCode(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleCode().run();
  }

  toggleUnderline(): void {
    this.checkDestroyed();
    // TipTap StarterKit doesn't include underline by default
    // This would require the @tiptap/extension-underline extension
    try {
      (this.editor.chain().focus() as any).toggleUnderline().run();
    } catch {
      console.warn("Underline extension not available");
    }
  }

  toggleHighlight(color?: string): void {
    this.checkDestroyed();
    if (color) {
      this.editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      this.editor.chain().focus().toggleHighlight().run();
    }
  }

  toggleHeading(level: HeadingLevel): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleOrderedList().run();
  }

  toggleTaskList(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleTaskList().run();
  }

  toggleBlockquote(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock(): void {
    this.checkDestroyed();
    this.editor.chain().focus().toggleCodeBlock().run();
  }

  insertHorizontalRule(): void {
    this.checkDestroyed();
    this.editor.chain().focus().setHorizontalRule().run();
  }

  setLink(url: string): void {
    this.checkDestroyed();
    // Link extension may not be available in all configurations
    try {
      (this.editor.chain().focus() as any).setLink({ href: url }).run();
    } catch {
      console.warn("Link extension not available");
    }
  }

  unsetLink(): void {
    this.checkDestroyed();
    try {
      (this.editor.chain().focus() as any).unsetLink().run();
    } catch {
      console.warn("Link extension not available");
    }
  }

  // ---------------------------------------------------------------------------
  // State Queries
  // ---------------------------------------------------------------------------

  isActive(format: FormatType, attrs?: Record<string, unknown>): boolean {
    this.checkDestroyed();
    const formatMap: Record<FormatType, string> = {
      bold: "bold",
      italic: "italic",
      strike: "strike",
      code: "code",
      underline: "underline",
      highlight: "highlight",
      link: "link",
      heading: "heading",
      bulletList: "bulletList",
      orderedList: "orderedList",
      taskList: "taskList",
      blockquote: "blockquote",
      codeBlock: "codeBlock",
      horizontalRule: "horizontalRule",
    };

    const tipTapFormat = formatMap[format];
    return attrs
      ? this.editor.isActive(tipTapFormat, attrs)
      : this.editor.isActive(tipTapFormat);
  }

  canUndo(): boolean {
    this.checkDestroyed();
    return this.editor.can().undo();
  }

  canRedo(): boolean {
    this.checkDestroyed();
    return this.editor.can().redo();
  }

  isEmpty(): boolean {
    this.checkDestroyed();
    return this.editor.isEmpty;
  }

  isFocused(): boolean {
    this.checkDestroyed();
    return this.editor.isFocused;
  }

  isEditable(): boolean {
    this.checkDestroyed();
    return this.editor.isEditable;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  undo(): void {
    this.checkDestroyed();
    this.editor.chain().focus().undo().run();
  }

  redo(): void {
    this.checkDestroyed();
    this.editor.chain().focus().redo().run();
  }

  focus(): void {
    this.checkDestroyed();
    this.editor.commands.focus();
  }

  blur(): void {
    this.checkDestroyed();
    this.editor.commands.blur();
  }

  setEditable(editable: boolean): void {
    this.checkDestroyed();
    this.editor.setEditable(editable);
  }

  // ---------------------------------------------------------------------------
  // Selection Operations
  // ---------------------------------------------------------------------------

  selectAll(): void {
    this.checkDestroyed();
    this.editor.commands.selectAll();
  }

  getSelectedText(): string {
    this.checkDestroyed();
    const { from, to } = this.editor.state.selection;
    return this.editor.state.doc.textBetween(from, to, " ");
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  onUpdate(callback: (content: DocumentContent) => void): () => void {
    this.checkDestroyed();
    const handler = () => callback(this.getContent());
    this.editor.on("update", handler);
    return () => this.editor.off("update", handler);
  }

  onSelectionChange(callback: () => void): () => void {
    this.checkDestroyed();
    this.editor.on("selectionUpdate", callback);
    return () => this.editor.off("selectionUpdate", callback);
  }

  onFocus(callback: () => void): () => void {
    this.checkDestroyed();
    this.editor.on("focus", callback);
    return () => this.editor.off("focus", callback);
  }

  onBlur(callback: () => void): () => void {
    this.checkDestroyed();
    this.editor.on("blur", callback);
    return () => this.editor.off("blur", callback);
  }

  // ---------------------------------------------------------------------------
  // Raw Access
  // ---------------------------------------------------------------------------

  getRawEditor(): TipTapEditor {
    this.checkDestroyed();
    return this.editor;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  destroy(): void {
    if (!this.destroyed) {
      this.editor.destroy();
      this.destroyed = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a TipTap editor adapter from an existing TipTap editor instance.
 */
export function createTipTapAdapter(editor: TipTapEditor): EditorAdapter {
  return new TipTapEditorAdapter(editor);
}

/**
 * Wrap an existing TipTap editor in an adapter.
 * Alias for createTipTapAdapter.
 */
export const wrapTipTapEditor = createTipTapAdapter;

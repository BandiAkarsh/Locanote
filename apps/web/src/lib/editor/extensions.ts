// ============================================================================
// TIPTAP EDITOR CONFIGURATION (extensions.ts)
// ============================================================================
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import * as Y from "yjs";

export interface CreateEditorOptions {
  element: HTMLElement;
  ydoc: Y.Doc;
  user: { name: string; color: string; id: string };
  onUpdate?: (props: { editor: Editor }) => void;
  onCreate?: (props: { editor: Editor }) => void;
  onFocus?: (props: { editor: Editor }) => void;
  onBlur?: (props: { editor: Editor }) => void;
  provider?: any;
}

export function createEditor(options: CreateEditorOptions): Editor {
  const { element, ydoc, user, onUpdate, onCreate, onFocus, onBlur, provider } =
    options;

  const extensions: any[] = [
    StarterKit.configure({
      history: false, // Collaboration has its own undo manager
    }),
    Typography,
    Highlight.configure({
      multicolor: true,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: "Start typing your ideas...",
      emptyEditorClass: "is-empty",
    }),
    Collaboration.configure({
      document: ydoc,
      field: "content", // CRITICAL: Must match doc.svelte.ts
    }),
  ];

  if (provider) {
    extensions.push(
      CollaborationCursor.configure({
        provider: provider,
        user: user,
      }),
    );
  }

  return new Editor({
    element,
    extensions,
    editable: true,
    autofocus: true,
    injectCSS: false,
    onUpdate,
    onCreate,
    onFocus,
    onBlur,
  });
}

export function updateUserCursor(
  editor: Editor,
  user: { name: string; color: string; id: string },
): void {
  const collaborationCursor = editor.extensionManager.extensions.find(
    (ext) => ext.name === "collaborationCursor",
  );

  if (collaborationCursor) {
    collaborationCursor.options.user = user;
  }
}

/**
 * Properly cleanup an editor instance
 */
export function destroyEditor(editor: Editor): void {
  editor.destroy();
}

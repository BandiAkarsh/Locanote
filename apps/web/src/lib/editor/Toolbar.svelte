<!-- =========================================================================
TOOLBAR COMPONENT (Toolbar.svelte)
============================================================================
A beautiful floating toolbar for the TipTap editor with formatting controls.

FEATURES:
- Text formatting (bold, italic, underline, strike)
- Headings (H1, H2, H3)
- Lists (bullet, numbered, task)
- Blockquotes and code blocks
- Text highlighting
- Beautiful glassmorphism design
- Active state indicators
- Tooltips on hover

USAGE:
<Toolbar {editor} />
========================================================================== -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  
  // Props
  let { editor }: { editor: Editor } = $props();

  // Helper function to check if a format is active
  function isActive(name: string, options?: Record<string, any>): boolean {
    return editor?.isActive(name, options) ?? false;
  }

  // Helper function to toggle formatting
  function toggle(name: string, options?: Record<string, any>) {
    return () => {
      editor?.chain().focus().toggleMark(name, options).run();
    };
  }
</script>

<!-- Floating Toolbar -->
<div class="sticky top-0 z-50 mb-4">
  <div class="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
    
    <!-- Text Formatting Group -->
    <div class="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-gray-700">
      <!-- Bold -->
      <button
        onclick={() => editor?.chain().focus().toggleBold().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Bold (Ctrl+B)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
        </svg>
      </button>

      <!-- Italic -->
      <button
        onclick={() => editor?.chain().focus().toggleItalic().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Italic (Ctrl+I)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <!-- Strikethrough -->
      <button
        onclick={() => editor?.chain().focus().toggleStrike().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('strike') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Strikethrough"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 16v-6m12 6v-6M6 12h12M6 8h12" />
        </svg>
      </button>

      <!-- Highlight -->
      <button
        onclick={() => editor?.chain().focus().toggleHighlight().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('highlight') ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Highlight"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>
    </div>

    <!-- Headings Group -->
    <div class="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
      <!-- H1 -->
      <button
        onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        class="px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 {isActive('heading', { level: 1 }) ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Heading 1"
      >
        H1
      </button>

      <!-- H2 -->
      <button
        onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        class="px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 {isActive('heading', { level: 2 }) ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Heading 2"
      >
        H2
      </button>

      <!-- H3 -->
      <button
        onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        class="px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 {isActive('heading', { level: 3 }) ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Heading 3"
      >
        H3
      </button>
    </div>

    <!-- Lists Group -->
    <div class="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
      <!-- Bullet List -->
      <button
        onclick={() => editor?.chain().focus().toggleBulletList().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Bullet List"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Numbered List -->
      <button
        onclick={() => editor?.chain().focus().toggleOrderedList().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Numbered List"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </button>

      <!-- Task List -->
      <button
        onclick={() => editor?.chain().focus().toggleTaskList().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('taskList') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Task List"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </button>
    </div>

    <!-- Blocks Group -->
    <div class="flex items-center gap-0.5 pl-2">
      <!-- Blockquote -->
      <button
        onclick={() => editor?.chain().focus().toggleBlockquote().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Quote"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      <!-- Code Block -->
      <button
        onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
        class="p-2 rounded-lg transition-all duration-200 {isActive('codeBlock') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
        title="Code Block"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <!-- Horizontal Rule -->
      <button
        onclick={() => editor?.chain().focus().setHorizontalRule().run()}
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        title="Divider"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
    </div>

    <!-- Undo/Redo Group -->
    <div class="flex items-center gap-0.5 pl-2 ml-auto border-l border-gray-200 dark:border-gray-700">
      <!-- Undo -->
      <button
        onclick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().undo()}
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <!-- Redo -->
      <button
        onclick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().redo()}
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </button>
    </div>
  </div>
</div>

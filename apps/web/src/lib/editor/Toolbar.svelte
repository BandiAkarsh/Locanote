<!-- =========================================================================
TOOLBAR COMPONENT (Toolbar.svelte)
============================================================================ -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  
  // Props
  let { editor }: { editor: Editor | null } = $props();

  // Helper function to check if a format is active
  function isActive(name: string, options?: Record<string, any>): boolean {
    return editor?.isActive(name, options) ?? false;
  }
</script>

<div class="flex items-center gap-1 p-1 sm:p-2 rounded-xl bg-transparent overflow-x-auto scrollbar-hide">
  
  <!-- Text Formatting Group -->
  <div class="flex items-center gap-0.5 pr-2 border-r border-[var(--ui-border)]">
    <!-- Bold -->
    <button
      onclick={() => editor?.chain().focus().toggleBold().run()}
      class="p-2 rounded-lg transition-all duration-200 {isActive('bold') ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 hover:text-[var(--ui-text)]'}"
      title="Bold (Ctrl+B)"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
      </svg>
    </button>

    <!-- Italic -->
    <button
      onclick={() => editor?.chain().focus().toggleItalic().run()}
      class="p-2 rounded-lg transition-all duration-200 {isActive('italic') ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 hover:text-[var(--ui-text)]'}"
      title="Italic (Ctrl+I)"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>

    <!-- Highlight -->
    <button
      onclick={() => editor?.chain().focus().toggleHighlight().run()}
      class="p-2 rounded-lg transition-all duration-200 {isActive('highlight') ? 'bg-amber-100 text-amber-700' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 hover:text-[var(--ui-text)]'}"
      title="Highlight"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    </button>
  </div>

  <!-- Headings Group -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      class="px-2.5 py-1.5 rounded-lg font-black text-xs transition-all {isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10'}"
    >H1</button>
    <button
      onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      class="px-2.5 py-1.5 rounded-lg font-black text-xs transition-all {isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10'}"
    >H2</button>
  </div>

  <!-- Lists Group -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().toggleBulletList().run()}
      class="p-2 rounded-lg transition-all {isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10'}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <button
      onclick={() => editor?.chain().focus().toggleTaskList().run()}
      class="p-2 rounded-lg transition-all {isActive('taskList') ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10'}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </button>
  </div>

  <!-- Blocks Group -->
  <div class="flex items-center gap-0.5 px-2">
    <button
      onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
      class="p-2 rounded-lg transition-all {isActive('codeBlock') ? 'bg-primary/20 text-primary' : 'text-[var(--ui-text-muted)] hover:bg-primary/10'}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>
    <button
      onclick={() => editor?.chain().focus().setHorizontalRule().run()}
      class="p-2 rounded-lg text-[var(--ui-text-muted)] hover:bg-primary/10 transition-all"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
      </svg>
    </button>
  </div>

  <!-- History Group (Hidden on mobile bubble if needed, but keeping for now) -->
  <div class="flex items-center gap-0.5 pl-2 ml-auto border-l border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().undo().run()}
      disabled={!editor?.can().undo()}
      class="p-2 rounded-lg text-[var(--ui-text-muted)] hover:bg-primary/10 disabled:opacity-20"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>
  </div>
</div>

<!-- =========================================================================
TOOLBAR COMPONENT (Toolbar.svelte)
============================================================================ -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { onMount, onDestroy } from 'svelte';
  import { ui } from '$stores';
  import { voice } from '$lib/services/voice.svelte';
  
  // Props
  let { editor }: { editor: Editor | null } = $props();

  // Reactive states
  let isBold = $state(false);
  let isItalic = $state(false);
  let isHighlight = $state(false);
  let isH1 = $state(false);
  let isH2 = $state(false);
  let isBulletList = $state(false);
  let isTaskList = $state(false);
  let isCodeBlock = $state(false);
  let isBlockquote = $state(false);

  let interimText = $state('');
  let lastInterimLength = 0;

  // Reactive styles using Svelte 5 $derived
  let glowClasses = $derived({
    bold: isBold ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    italic: isItalic ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    highlight: isHighlight ? 'bg-amber-500/30 text-amber-500 ring-4 ring-amber-500/20 border-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    h1: isH1 ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    h2: isH2 ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    bulletList: isBulletList ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    taskList: isTaskList ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    codeBlock: isCodeBlock ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent',
    blockquote: isBlockquote ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent'
  });

  function updateActiveStates() {
    if (!editor) return;
    isBold = editor.isActive('bold');
    isItalic = editor.isActive('italic');
    isHighlight = editor.isActive('highlight');
    isH1 = editor.isActive('heading', { level: 1 });
    isH2 = editor.isActive('heading', { level: 2 });
    isBulletList = editor.isActive('bulletList');
    isTaskList = editor.isActive('taskList');
    isCodeBlock = editor.isActive('codeBlock');
    isBlockquote = editor.isActive('blockquote');
  }

  onMount(() => {
    if (editor) {
      editor.on('transaction', updateActiveStates);
      editor.on('selectionUpdate', updateActiveStates);
      editor.on('update', updateActiveStates);
      editor.on('focus', updateActiveStates);
      updateActiveStates();
    }

    voice.onResult = (text, isInterim) => {
      if (!editor) return;

      if (isInterim) {
        // REAL-TIME STREAMING FEEL:
        const { from } = editor.state.selection;
        
        editor.chain()
          .focus()
          .deleteRange({ from: from - lastInterimLength, to: from })
          .insertContent(text + ' ')
          .run();
        
        lastInterimLength = text.length + 1;
        interimText = text;
      } else {
        // FINAL RESULT
        lastInterimLength = 0;
        interimText = '';
        console.log('[Voice] Final result committed');
      }
    };
  });

  onDestroy(() => {
    if (editor) {
      editor.off('transaction', updateActiveStates);
      editor.off('selectionUpdate', updateActiveStates);
      editor.off('update', updateActiveStates);
      editor.off('focus', updateActiveStates);
    }
  });

  function handleVoiceClick() {
    if (voice.status === 'idle' || voice.status === 'error') {
      voice.loadModel();
    } else if (voice.status === 'ready') {
      lastInterimLength = 0;
      voice.startListening();
    } else if (voice.status === 'listening') {
      voice.stopListening();
    }
  }

  // Reactive class helper for the glow effect
  function getGlowClass(active: boolean): string {
    return active ? 'toolbar-btn-active' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent';
  }
</script>

<div class="flex items-center gap-1 p-1 sm:p-2 rounded-xl bg-transparent overflow-x-auto scrollbar-hide relative">
  
  <!-- Neural Engine Progress -->
  {#if voice.status === 'loading'}
    <div class="absolute -top-14 left-0 w-48 p-3 premium-card z-50 animate-in fade-in slide-in-from-bottom-2 text-[9px] font-black uppercase tracking-widest text-primary">
      <div class="flex justify-between mb-1"><span>Neural Engine</span><span>{Math.round(voice.progress)}%</span></div>
      <div class="h-1 bg-primary/10 rounded-full overflow-hidden"><div class="h-full bg-primary" style="width: {voice.progress}%"></div></div>
    </div>
  {/if}

  <!-- Active Listening Indicator -->
  {#if voice.status === 'listening' || voice.status === 'processing'}
    <div class="absolute -top-12 left-0 px-4 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-lg animate-pulse z-50 flex items-center gap-2 whitespace-nowrap">
      <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
      {voice.status === 'listening' ? 'AI LISTENING' : 'TRANSCRIBING'}
    </div>
  {/if}

  <!-- Voice Group -->
  <div class="flex items-center gap-0.5 pr-2 border-r border-[var(--ui-border)]">
    <button
      onclick={handleVoiceClick}
      disabled={voice.status === 'loading' || voice.status === 'processing'}
      class="p-2 rounded-xl transition-all duration-300 border-2 disabled:opacity-50
             {voice.status === 'listening' ? 'bg-red-500/20 text-red-500 ring-4 ring-red-500/20 border-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent'}"
      aria-label="Voice Dictation"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {#if voice.status === 'listening'}
          <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Formatting -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button onclick={() => editor?.chain().focus().toggleBold().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isBold)}" aria-label="Bold"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg></button>
    <button onclick={() => editor?.chain().focus().toggleItalic().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isItalic)}" aria-label="Italic"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></button>
    <button onclick={() => editor?.chain().focus().toggleHighlight().run()} class="p-2 rounded-xl transition-all border-2 {isHighlight ? 'bg-amber-500/30 text-amber-500 ring-4 ring-amber-500/20 border-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent'}" aria-label="Highlight"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg></button>
  </div>

  <!-- Headings -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} class="px-2.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 {getGlowClass(isH1)}" aria-label="Heading 1">H1</button>
    <button onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} class="px-2.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 {getGlowClass(isH2)}" aria-label="Heading 2">H2</button>
  </div>

  <!-- Lists -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button onclick={() => editor?.chain().focus().toggleBulletList().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isBulletList)}" aria-label="Bullet List"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
    <button onclick={() => editor?.chain().focus().toggleTaskList().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isTaskList)}" aria-label="Task List"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></button>
  </div>

  <!-- Blocks -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    {#if !ui.cleanMode}
      <button onclick={() => editor?.chain().focus().toggleCodeBlock().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isCodeBlock)}" aria-label="Code Block"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></button>
    {/if}
    <button onclick={() => editor?.chain().focus().toggleBlockquote().run()} class="p-2 rounded-xl transition-all border-2 {getGlowClass(isBlockquote)}" aria-label="Quote"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg></button>
  </div>

  <!-- History -->
  <div class="flex items-center gap-0.5 pl-2 ml-auto">
    <button onclick={() => editor?.chain().focus().undo().run()} class="p-2 rounded-xl text-[var(--ui-text-muted)] hover:text-primary transition-all border-2 border-transparent" aria-label="Undo"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
  </div>
</div>

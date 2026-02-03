<!-- =========================================================================
TOOLBAR COMPONENT (Toolbar.svelte)
============================================================================ -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { onMount, onDestroy } from 'svelte';
  import { ui } from '$stores';
  
  // Props
  let { editor }: { editor: Editor | null } = $props();

  // Voice state
  let isListening = $state(false);
  let recognition: any = null;
  let interimText = $state('');
  
  // State for button highlights
  let activeFormats = $state({
    bold: false,
    italic: false,
    highlight: false,
    heading1: false,
    heading2: false,
    bulletList: false,
    taskList: false,
    codeBlock: false,
    blockquote: false
  });

  // Update active states - specifically called on editor events
  function updateActiveStates() {
    if (!editor) return;
    activeFormats = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      highlight: editor.isActive('highlight'),
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      bulletList: editor.isActive('bulletList'),
      taskList: editor.isActive('taskList'),
      codeBlock: editor.isActive('codeBlock'),
      blockquote: editor.isActive('blockquote')
    };
  }

  // Initialize Speech Recognition and Editor Listeners
  onMount(() => {
    // 1. Setup Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        interimText = currentInterim;

        if (finalTranscript) {
          console.log('[Voice] Recognized Final:', finalTranscript);
          if (editor) {
            // Focus and insert text
            editor.commands.focus();
            editor.commands.insertContent(finalTranscript.trim() + ' ');
          }
        }
      };

      recognition.onstart = () => {
        console.log('[Voice] Recognition started');
        isListening = true;
      };

      recognition.onend = () => {
        console.log('[Voice] Recognition ended');
        // RESTART if the user didn't manually stop it
        if (isListening) {
          try {
            recognition.start();
            console.log('[Voice] Auto-restarted');
          } catch (err) {
            console.warn('[Voice] Restart failed:', err);
            isListening = false;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[Voice] Error:', event.error);
        if (event.error === 'not-allowed') {
          isListening = false;
          alert('Please enable microphone access in your browser settings.');
        }
      };
    }

    // 2. Setup Editor Listeners for Glow persistence
    if (editor) {
      editor.on('transaction', updateActiveStates);
      editor.on('selectionUpdate', updateActiveStates);
      editor.on('update', updateActiveStates);
      updateActiveStates();
    }
  });

  onDestroy(() => {
    if (recognition) {
      isListening = false;
      recognition.stop();
    }
  });

  function toggleVoice() {
    if (!recognition) {
      alert('Voice-to-text is not supported in this browser.');
      return;
    }

    if (isListening) {
      console.log('[Voice] Manual stop');
      isListening = false;
      recognition.stop();
      interimText = '';
    } else {
      try {
        console.log('[Voice] Manual start');
        recognition.start();
        // isListening will be set in onstart
      } catch (err) {
        console.error('[Voice] Start failed:', err);
        isListening = false;
      }
    }
  }

  // Reactive class helper for the glow effect
  function getGlowClass(active: boolean): string {
    return active 
      ? 'bg-primary/20 text-primary ring-2 ring-primary shadow-[0_0_15px_rgba(var(--brand-color-rgb),0.5)] border-primary' 
      : 'text-[var(--ui-text-muted)] hover:bg-primary/10 hover:text-primary border-transparent';
  }
</script>

<div class="flex items-center gap-1 p-1 sm:p-2 rounded-xl bg-transparent overflow-x-auto scrollbar-hide relative">
  
  <!-- Voice Tooltip Indicator -->
  {#if isListening}
    <div class="absolute -top-12 left-0 px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-xl animate-bounce z-50 flex items-center gap-2 whitespace-nowrap">
      <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
      LISTENING{interimText ? `: "${interimText}"` : '...'}
    </div>
  {/if}

  <!-- Voice Group -->
  <div class="flex items-center gap-0.5 pr-2 border-r border-[var(--ui-border)]">
    <button
      onclick={toggleVoice}
      class="p-2 rounded-lg transition-all duration-300 border-2
             {isListening ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] border-red-500 animate-pulse' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent'}"
      title="Voice Dictation"
      aria-label="Voice Dictation"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {#if isListening}
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Formatting -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().toggleBold().run()}
      class="p-2 rounded-lg transition-all duration-200 border-2 {getGlowClass(activeFormats.bold)}"
      title="Bold"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
      </svg>
    </button>
    
    <button
      onclick={() => editor?.chain().focus().toggleItalic().run()}
      class="p-2 rounded-lg transition-all duration-200 border-2 {getGlowClass(activeFormats.italic)}"
      title="Italic"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>

    <button
      onclick={() => editor?.chain().focus().toggleHighlight().run()}
      class="p-2 rounded-lg transition-all duration-200 border-2 {activeFormats.highlight ? 'bg-amber-500/20 text-amber-500 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] border-amber-500' : 'text-[var(--ui-text-muted)] hover:bg-primary/10 border-transparent'}"
      title="Highlight"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    </button>
  </div>

  <!-- Headings -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      class="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all border-2 {getGlowClass(activeFormats.heading1)}"
    >H1</button>
    <button
      onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      class="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all border-2 {getGlowClass(activeFormats.heading2)}"
    >H2</button>
  </div>

  <!-- Lists -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    <button
      onclick={() => editor?.chain().focus().toggleBulletList().run()}
      class="p-2 rounded-lg transition-all border-2 {getGlowClass(activeFormats.bulletList)}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <button
      onclick={() => editor?.chain().focus().toggleTaskList().run()}
      class="p-2 rounded-lg transition-all border-2 {getGlowClass(activeFormats.taskList)}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </button>
  </div>

  <!-- Blocks -->
  <div class="flex items-center gap-0.5 px-2 border-r border-[var(--ui-border)]">
    {#if !ui.cleanMode}
      <button
        onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
        class="p-2 rounded-lg transition-all border-2 {getGlowClass(activeFormats.codeBlock)}"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>
    {/if}
    <button
      onclick={() => editor?.chain().focus().toggleBlockquote().run()}
      class="p-2 rounded-lg transition-all border-2 {getGlowClass(activeFormats.blockquote)}"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    </button>
  </div>

  <!-- History -->
  <div class="flex items-center gap-0.5 pl-2 ml-auto">
    <button
      onclick={() => editor?.chain().focus().undo().run()}
      class="p-2 rounded-lg text-[var(--ui-text-muted)] hover:bg-primary/10 transition-all border-2 border-transparent"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>
  </div>
</div>

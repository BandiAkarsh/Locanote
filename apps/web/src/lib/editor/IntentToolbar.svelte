<!-- =========================================================================
INTENT TOOLBAR (IntentToolbar.svelte)
============================================================================ -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { intent } from '$lib/services/intent.svelte';
  import Toolbar from './Toolbar.svelte';
  import { fly, fade } from 'svelte/transition';

  let { editor }: { editor: Editor | null } = $props();

  // Mode-specific labels and themes
  const modeInfo = {
    recipe: { label: 'Chef Mode', color: 'emerald', icon: '🍳' },
    task: { label: 'Project Mode', color: 'blue', icon: '🎯' },
    code: { label: 'Developer Mode', color: 'indigo', icon: '💻' },
    journal: { label: 'Zen Mode', color: 'rose', icon: '📔' },
    none: { label: '', color: '', icon: '' }
  };
</script>

<div class="space-y-2">
  <!-- Intent Notification (The "Magical" Part) -->
  {#if intent.currentMode !== 'none'}
    <div 
      in:fly={{ y: -10, duration: 400 }} 
      out:fade
      class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ui-surface-elevated)] border border-primary/20 shadow-lg w-fit mx-auto sm:mx-0"
    >
      <span class="text-sm">{modeInfo[intent.currentMode].icon}</span>
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        {modeInfo[intent.currentMode].label} Activated
      </span>
      <button 
        onclick={() => intent.reset()}
        class="ml-2 text-[var(--ui-text-muted)] hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  {/if}

  <!-- The Main Toolbar with Contextual Tools -->
  <div class="premium-card p-1 sm:p-2 flex flex-wrap items-center gap-2 overflow-hidden transition-all duration-500">
    <Toolbar {editor} />
    
    <!-- Context-Specific Snap-ins (GenUI) -->
    {#if intent.currentMode === 'recipe'}
      <div in:fly={{ x: 20 }} class="flex items-center gap-1 pl-2 border-l border-[var(--ui-border)]">
        <button class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Timer
        </button>
        <button class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Scale
        </button>
      </div>
    {:else if intent.currentMode === 'task'}
      <div in:fly={{ x: 20 }} class="flex items-center gap-1 pl-2 border-l border-[var(--ui-border)]">
        <button class="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Priority
        </button>
        <button class="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Calendar
        </button>
      </div>
    {:else if intent.currentMode === 'code'}
      <div in:fly={{ x: 20 }} class="flex items-center gap-1 pl-2 border-l border-[var(--ui-border)]">
        <button class="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Format
        </button>
        <button class="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all font-bold text-[10px] uppercase tracking-widest">
          Run
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .premium-card {
    border-radius: 1rem;
  }
</style>

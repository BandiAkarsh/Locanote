<!-- =========================================================================
INTENT TOOLBAR (IntentToolbar.svelte)
============================================================================ -->

<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { intent } from '$lib/services/intent.svelte';
  import Toolbar from './Toolbar.svelte';
  import { fly, fade } from 'svelte/transition';
  
  // Custom tools for GenUI
  import ChefTool from './tools/ChefTool.svelte';
  import ProjectTool from './tools/ProjectTool.svelte';
  import DevTool from './tools/DevTool.svelte';

  let { editor }: { editor: Editor | null } = $props();

  // Mode-specific labels and themes
  const modeInfo = {
    recipe: { label: 'Chef Mode', color: 'emerald', icon: '🍳', component: ChefTool },
    task: { label: 'Project Mode', color: 'blue', icon: '🎯', component: ProjectTool },
    code: { label: 'Developer Mode', color: 'indigo', icon: '💻', component: DevTool },
    journal: { label: 'Zen Mode', color: 'rose', icon: '📔', component: null },
    none: { label: '', color: '', icon: '', component: null }
  };
</script>

<div class="space-y-3 w-full animate-fade-in">
  <!-- Intent Notification (The "Magical" Part) -->
  {#if intent.currentMode !== 'none'}
    <div 
      in:fly={{ y: -10, duration: 400 }} 
      out:fade
      class="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ui-surface-elevated)] border border-primary/30 shadow-xl w-fit mx-auto sm:mx-0 transition-all duration-500"
    >
      <span class="text-lg">{modeInfo[intent.currentMode].icon}</span>
      <span class="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
        {modeInfo[intent.currentMode].label} Active
      </span>
      <div class="w-1 h-4 bg-primary/20 mx-2"></div>
      <button 
        onclick={() => intent.reset()}
        class="text-[var(--ui-text-muted)] hover:text-red-500 transition-colors"
        title="Exit Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  {/if}

  <!-- The Main Toolbar with Contextual Tools -->
  <div class="premium-card p-1.5 sm:p-2.5 flex flex-wrap items-center gap-2 overflow-hidden transition-all duration-700 shadow-2xl">
    <Toolbar {editor} />
    
    <!-- Context-Specific Snap-ins (GenUI) -->
    {#if intent.currentMode !== 'none' && modeInfo[intent.currentMode].component}
      {@const CustomTool = modeInfo[intent.currentMode].component}
      <div in:fly={{ x: 20 }} class="flex items-center gap-1 pl-2 border-l border-[var(--ui-border)] ml-1">
        <CustomTool {editor} />
      </div>
    {/if}
  </div>
</div>

<style>
  .premium-card {
    border-radius: 1.25rem;
    background: var(--ui-surface-elevated);
    border: 1px solid var(--ui-border);
  }
</style>

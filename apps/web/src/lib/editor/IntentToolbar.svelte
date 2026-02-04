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

  // Mode-specific labels and themes (Linear style with physical glass colors)
  const modeInfo = {
    recipe: { label: 'Chef Mode', color: 'emerald', icon: '🍳', component: ChefTool, themeColor: 'rgba(16, 185, 129, 0.4)', hex: '#10b981', rgb: '16, 185, 129' },
    task: { label: 'Project Mode', color: 'blue', icon: '🎯', component: ProjectTool, themeColor: 'rgba(59, 130, 246, 0.4)', hex: '#3b82f6', rgb: '59, 130, 246' },
    code: { label: 'Developer Mode', color: 'indigo', icon: '💻', component: DevTool, themeColor: 'rgba(99, 102, 241, 0.4)', hex: '#6366f1', rgb: '99, 102, 241' },
    journal: { label: 'Zen Mode', color: 'rose', icon: '📔', component: null, themeColor: 'rgba(244, 63, 94, 0.3)', hex: '#f43f5e', rgb: '244, 63, 94' },
    none: { label: '', color: '', icon: '', component: null, themeColor: 'transparent', hex: '#6366f1', rgb: '99, 102, 241' }
  };

  /**
   * GenUI Immersive Environment Shift
   * This $effect physically morphs the background material when user intent is detected.
   */
  $effect(() => {
    if (typeof document !== 'undefined') {
      const mode = intent.currentMode;
      const active = modeInfo[mode];
      
      // Update global CSS tokens for Glassmorphism 2.0
      document.documentElement.style.setProperty('--intent-bg-shift', active.themeColor);
      document.documentElement.style.setProperty('--accent-liquid', active.hex);
      document.documentElement.style.setProperty('--accent-liquid-rgb', active.rgb);
      document.documentElement.style.setProperty('--accent-glow', `rgba(${active.rgb}, 0.5)`);
    }
  });
</script>

<div class="space-y-4 w-full animate-fade-in">
  <!-- 1. ZERO-UI INTENT INDICATOR -->
  {#if intent.currentMode !== 'none'}
    <div 
      in:fly={{ y: -10, duration: 600, easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) }} 
      out:fade
      class="flex items-center gap-3 px-6 py-2.5 rounded-full glass-2 border-primary/40 shadow-glow w-fit mx-auto sm:mx-0 transition-all duration-700"
    >
      <span class="text-xl drop-shadow-lg">{modeInfo[intent.currentMode].icon}</span>
      <span class="text-[11px] font-black uppercase tracking-[0.3em] text-primary text-shadow-glow">
        {modeInfo[intent.currentMode].label} Active
      </span>
      <div class="w-1 h-4 bg-primary/20 mx-1"></div>
      <button 
        onclick={() => intent.reset()}
        class="p-1 text-[var(--ui-text-muted)] hover:text-red-500 transition-all hover:scale-110 active:scale-90"
        title="Reset Interface"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  {/if}

  <!-- 2. ADAPTIVE LIQUID TOOLBAR -->
  <div class="glass-2 p-2 sm:p-3 flex flex-wrap items-center gap-3 overflow-hidden transition-all duration-1000 rounded-[2rem] shadow-2xl">
    <Toolbar {editor} />
    
    <!-- Context-Specific Snap-ins (GenUI Atoms) -->
    {#if intent.currentMode !== 'none' && modeInfo[intent.currentMode].component}
      {@const CustomTool = modeInfo[intent.currentMode].component}
      <div in:fly={{ x: 30, duration: 800 }} class="flex items-center gap-2 pl-4 border-l-2 border-[var(--ui-border)] ml-2">
        <CustomTool {editor} />
      </div>
    {/if}
  </div>
</div>

<style>
  .glass-2 {
    /* Specialized toolbar frosting */
    background: rgba(var(--accent-liquid-rgb), 0.05);
    backdrop-filter: blur(30px);
  }
</style>

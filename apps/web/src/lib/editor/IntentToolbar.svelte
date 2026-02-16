<!-- =========================================================================
INTENT TOOLBAR (IntentToolbar.svelte) - M3 Expressive Design
======================================================================== -->

<script lang="ts">
  import { intent } from "$lib/services/intent.svelte";
  import { ui } from "$stores";
  import type { Editor } from "@tiptap/core";
  import ChefTool from "./tools/ChefTool.svelte";
  import ProjectTool from "./tools/ProjectTool.svelte";
  import DevTool from "./tools/DevTool.svelte";
  import Toolbar from "./Toolbar.svelte";

  let { editor }: { editor: Editor | null } = $props();

  const modeInfo: Record<string, any> = {
    recipe: { label: "Chef Mode", icon: "👨‍🍳", component: ChefTool },
    task: { label: "Project Mode", icon: "🚀", component: ProjectTool },
    code: { label: "Developer Mode", icon: "💻", component: DevTool },
    journal: { label: "Journal Mode", icon: "✍️", component: null },
    none: { label: "", icon: "", component: null },
  };

  // Debugging intent detection in UI during development/tests
  let debugIntent = $derived(
    (window as any).__PW_TEST__ ? intent.currentMode : null,
  );
</script>

<div class="space-y-4 w-full animate-fade-in" data-intent={intent.currentMode}>
  {#if debugIntent}
    <div class="hidden" id="pw-intent-status">{debugIntent}</div>
  {/if}

  {#if intent.currentMode !== "none"}
    <div
      class="flex items-center gap-3 px-6 py-2.5 rounded-full glass-2 border-primary/40 shadow-glow w-fit mx-auto sm:mx-0 transition-all duration-700 animate-slide-in-top"
    >
      <span class="text-xl drop-shadow-lg"
        >{modeInfo[intent.currentMode].icon}</span
      >
      <span
        class="text-[11px] font-black uppercase tracking-[0.3em] text-primary text-shadow-glow"
      >
        {modeInfo[intent.currentMode].label} Active
      </span>
      <div class="w-1 h-4 bg-primary/20 mx-1"></div>
      <button
        onclick={() => intent.reset()}
        class="p-1 text-[var(--ui-text-muted)] hover:text-red-500 transition-all hover:scale-110 active:scale-90"
        title="Reset Interface"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
        >
      </button>
    </div>
  {/if}

  <!-- 2. ADAPTIVE LIQUID TOOLBAR -->
  <div
    class="glass-2 p-2 sm:p-3 flex flex-wrap items-center gap-3 overflow-hidden transition-all duration-1000 rounded-[2rem] shadow-2xl"
  >
    <Toolbar {editor} />

    <!-- Context-Specific Snap-ins (GenUI Atoms) -->
    {#if intent.currentMode !== "none" && modeInfo[intent.currentMode].component}
      {@const CustomTool = modeInfo[intent.currentMode].component}
      <div
        class="flex items-center gap-2 pl-4 border-l-2 border-[var(--ui-border)] ml-2 animate-slide-in-left"
      >
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

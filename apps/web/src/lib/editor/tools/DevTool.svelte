<!-- =========================================================================
DEVELOPER MODE TOOL (DevTool.svelte)
============================================================================ -->

<script lang="ts">
  import { scale } from 'svelte/transition';
  import type { Editor } from '@tiptap/core';

  let { editor }: { editor: Editor | null } = $props();

  function formatCode() {
    if (!editor) return;
    // Simple mock formatter
    alert('Prettier Format: Code cleaned and aligned.');
  }
</script>

<div class="flex items-center gap-1 p-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20" in:scale={{ duration: 400, start: 0.8 }}>
  <button 
    onclick={formatCode}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-indigo-500 hover:bg-indigo-500/20 rounded transition-all"
  >
    Prettier
  </button>
  <button 
    onclick={() => alert('Code Execution: Run this snippet in a sandboxed environment.')}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-indigo-500 hover:bg-indigo-500/20 rounded transition-all"
  >
    Run
  </button>
</div>

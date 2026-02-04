<!-- =========================================================================
PROJECT MODE TOOL (ProjectTool.svelte)
============================================================================ -->

<script lang="ts">
  import { scale } from 'svelte/transition';
</script>

<div class="flex items-center gap-1 p-1 bg-blue-500/10 rounded-lg border border-blue-500/20" in:scale={{ duration: 400, start: 0.8 }}>
  <button 
    onclick={() => alert('Priority Filter: View only high-priority tasks.')}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:bg-blue-500/20 rounded transition-all"
  >
    Priority
  </button>
  <button 
    onclick={() => alert('Calendar View: Visualise your task deadlines.')}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:bg-blue-500/20 rounded transition-all"
  >
    Timeline
  </button>
</div>

<!-- =========================================================================
PROJECT MODE TOOL (ProjectTool.svelte)
======================================================================== -->

<script lang="ts">
  import type { Editor } from "@tiptap/core";

  let { editor }: { editor: Editor | null } = $props();
</script>

<div
  class="flex items-center gap-1 p-1 bg-blue-500/10 rounded-lg border border-blue-500/20 animate-scale-in"
>
  <button
    onclick={() => alert("Priority Filter: View only high-priority tasks.")}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:bg-blue-500/20 rounded transition-all"
  >
    Priority
  </button>
  <button
    onclick={() => alert("Calendar View: Visualise your task deadlines.")}
    class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:bg-blue-500/20 rounded transition-all"
  >
    Timeline
  </button>
</div>

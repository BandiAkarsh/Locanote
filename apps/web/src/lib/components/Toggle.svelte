<script lang="ts">
  let { checked = $bindable(false), label = "", id = "" } = $props();
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;
</script>

<label for={toggleId} class="inline-flex items-center cursor-pointer group">
  <div class="relative">
    <input id={toggleId} type="checkbox" bind:checked class="sr-only peer" />
    <div class="w-12 h-6 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-full 
                peer-checked:bg-primary transition-all duration-300 peer-checked:border-primary
                glow-border"></div>
    <div class="absolute left-1 top-1 w-4 h-4 bg-[var(--ui-text)] rounded-full transition-all duration-300
                peer-checked:translate-x-6 peer-checked:bg-white shadow-sm"></div>
  </div>
  {#if label}
    <span class="ml-3 text-sm font-bold text-[var(--ui-text)]">{label}</span>
  {/if}
</label>

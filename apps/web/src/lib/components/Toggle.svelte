<script lang="ts">
  let { checked = $bindable(false), label = "", id = "" } = $props();
  let toggleId = $derived(id || `toggle-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="inline-flex items-center gap-3">
  <button
    id={toggleId}
    type="button"
    role="switch"
    aria-checked={checked}
    onclick={() => checked = !checked}
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
           transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1
           {checked ? 'bg-primary' : 'bg-[var(--ui-surface-elevated)] border-[var(--ui-border)]'}"
  >
    <span class="sr-only">{label || 'Toggle switch'}</span>
    <span
      aria-hidden="true"
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
             transition duration-200 ease-in-out
             {checked ? 'translate-x-5' : 'translate-x-0'}"
    ></span>
  </button>
  {#if label}
    <label for={toggleId} class="text-sm font-bold text-[var(--ui-text)] cursor-pointer" onclick={() => checked = !checked}>
      {label}
    </label>
  {/if}
</div>

<!-- =========================================================================
TAG BADGE COMPONENT (TagBadge.svelte)
============================================================================
A small badge component for displaying tags with color indicators.

USAGE:
<TagBadge name="Work" color="#ef4444" />
<TagBadge name="Personal" color="#3b82f6" onRemove={() => removeTag()} />
========================================================================== -->

<script lang="ts">
  // Props
  let {
    name,
    color,
    onClick,
    onRemove,
    clickable = false,
    removable = false
  }: {
    name: string;
    color: string;
    onClick?: () => void;
    onRemove?: () => void;
    clickable?: boolean;
    removable?: boolean;
  } = $props();

  // Calculate text color based on background brightness
  function getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1f2937' : '#ffffff';
  }

  let textColor = $derived(getContrastColor(color));
</script>

<div
  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-all duration-200 {clickable ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1' : ''}"
  style="background-color: {color}20; color: {color}; border: 1px solid {color}40;"
  onclick={onClick}
  onkeydown={(e) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  }}
  role={clickable ? 'button' : 'status'}
  tabindex={clickable ? 0 : -1}
>
  <!-- Tag Color Indicator -->
  <span
    class="w-2 h-2 rounded-full"
    style="background-color: {color};"
  ></span>
  
  <!-- Tag Name -->
  <span>{name}</span>
  
  <!-- Remove Button -->
  {#if removable}
    <button
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
      class="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
      aria-label="Remove tag {name}"
    >
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>

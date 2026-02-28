<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    checked = $bindable(false),
    label = "",
    id = "",
    disabled = false,
    onchange,
    class: className = "",
    ...restProps
  }: Omit<HTMLButtonAttributes, "type"> & {
    checked?: boolean;
    label?: string;
    id?: string;
    disabled?: boolean;
    onchange?: () => void;
    class?: string;
  } = $props();

  let toggleId = $derived(
    id || `toggle-${Math.random().toString(36).slice(2, 9)}`,
  );

  function handleClick() {
    if (!disabled) {
      checked = !checked;
      onchange?.();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div class="inline-flex items-center gap-3 {className}">
  <button
    {id}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label || "Toggle switch"}
    {disabled}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    class="
      relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full
      border-2 border-transparent
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--nm-accent-subtle)]
      disabled:opacity-40 disabled:cursor-not-allowed
      {checked
      ? 'bg-[var(--nm-accent)]'
      : 'bg-[var(--nm-bg-tertiary)] border-[var(--nm-border)]'}"
    {...restProps}
  >
    <span class="sr-only">{label || "Toggle switch"}</span>
    <span
      aria-hidden="true"
      class="
        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0
        transition-transform duration-200 ease-out
        {checked ? 'translate-x-5' : 'translate-x-0'}"
    ></span>
  </button>
  {#if label}
    <span class="text-sm font-medium text-[var(--nm-text-primary)]">
      {label}
    </span>
  {/if}
</div>

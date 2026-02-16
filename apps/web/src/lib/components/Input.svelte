<!-- =========================================================================
INPUT COMPONENT (Input.svelte) - M3 Expressive Design
======================================================================== -->

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  type Props = Omit<HTMLInputAttributes, "value" | "size"> & {
    label?: string;
    error?: string;
    hint?: string;
    value?: string;
    icon?: Snippet;
    size?: "default" | "sm";
  };

  let {
    label,
    error,
    hint,
    value = $bindable(""),
    type = "text",
    disabled = false,
    class: className = "",
    id,
    icon,
    size = "default",
    ...restProps
  }: Props = $props();

  const inputId = $derived(
    id ?? `input-${Math.random().toString(36).slice(2, 9)}`,
  );
  let inputElement: HTMLInputElement;

  export function focus() {
    inputElement?.focus();
  }
</script>

<div class="flex flex-col gap-2 {className}">
  {#if label}
    <label
      for={inputId}
      class="text-[13px] font-medium text-[var(--m3-on-surface)] ml-1"
    >
      {label}
    </label>
  {/if}

  <div class="relative group">
    {#if icon}
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--m3-on-surface-variant)] transition-all duration-200 group-focus-within:text-[var(--m3-primary)] group-focus-within:scale-110"
      >
        {@render icon()}
      </div>
    {/if}

    <input
      bind:this={inputElement}
      {type}
      id={inputId}
      bind:value
      {disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error
        ? `${inputId}-error`
        : hint
          ? `${inputId}-hint`
          : undefined}
      class="
        w-full rounded-xl
        text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)]
        bg-[var(--m3-surface)]
        border-2 border-[var(--m3-outline-variant)]
        transition-all duration-200 ease-out
        hover:border-[var(--m3-outline)]
        focus:outline-none focus:border-[var(--m3-primary)] focus:ring-4 focus:ring-[var(--m3-primary-container)]/30
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--m3-outline-variant)]
        {error
        ? 'border-[var(--m3-error)] focus:border-[var(--m3-error)] focus:ring-[var(--m3-error-container)]/30'
        : ''}
        {icon ? 'pl-12 pr-4' : 'px-4'}
        {size === 'sm' ? 'py-2.5 text-sm' : 'py-3.5'}
      "
      {...restProps}
    />
  </div>

  {#if error}
    <p
      id="{inputId}-error"
      class="text-xs font-medium text-[var(--m3-error)] ml-1 animate-slide-in-bottom"
      role="alert"
    >
      {error}
    </p>
  {:else if hint}
    <p
      id="{inputId}-hint"
      class="text-xs text-[var(--m3-on-surface-variant)] ml-1"
    >
      {hint}
    </p>
  {/if}
</div>

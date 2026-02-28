<!-- =========================================================================
INPUT COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Clean, minimal input with excellent accessibility.

FEATURES:
- Label support with required indicator
- Error and hint text
- Icon support
- Full accessibility (ARIA labels, describedby)
- Reduced motion support
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
    required?: boolean;
  };

  let {
    label,
    error,
    hint,
    value = $bindable(""),
    type = "text",
    disabled = false,
    required = false,
    class: className = "",
    id,
    icon,
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
    <label for={inputId} class="nm-label {required ? 'nm-label-required' : ''}">
      {label}
    </label>
  {/if}

  <div class="nm-input-wrapper">
    {#if icon}
      <div class="nm-input-icon">
        {@render icon()}
      </div>
    {/if}

    <input
      bind:this={inputElement}
      {type}
      id={inputId}
      bind:value
      {disabled}
      {required}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error
        ? `${inputId}-error`
        : hint
          ? `${inputId}-hint`
          : undefined}
      class="
        nm-input
        {error ? 'nm-input-error' : ''}
        {icon ? 'nm-input-with-icon' : ''}
      "
      {...restProps}
    />
  </div>

  {#if error}
    <p id="{inputId}-error" class="nm-error nm-animate-fade-in" role="alert">
      <svg
        class="w-3.5 h-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {error}
    </p>
  {:else if hint}
    <p id="{inputId}-hint" class="nm-hint">
      {hint}
    </p>
  {/if}
</div>

<style>
  .nm-input-with-icon {
    padding-left: var(--nm-space-10);
  }
</style>

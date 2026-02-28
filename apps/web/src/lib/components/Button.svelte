<!-- =========================================================================
BUTTON COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Clean, minimal buttons with refined micro-interactions.

FEATURES:
- Smooth hover and active states
- Accessible focus indicators
- Loading state support
- Multiple variants and sizes
- Reduced motion support
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    variant?: "primary" | "secondary" | "ghost" | "text" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    children: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled = false,
    type = "button",
    children,
    class: className = "",
    ...restProps
  }: Props = $props();

  const variantClasses = {
    primary: "nm-btn-primary",
    secondary: "nm-btn-secondary",
    ghost: "nm-btn-ghost",
    text: "nm-btn-text",
    danger: "nm-btn-danger",
  };

  const sizeClasses = {
    sm: "nm-btn-sm",
    md: "",
    lg: "nm-btn-lg",
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  aria-busy={loading}
  class="
    nm-btn
    {variantClasses[variant]}
    {sizeClasses[size]}
    {fullWidth ? 'nm-btn-full' : ''}
    {className}
  "
  {...restProps}
>
  {#if loading}
    <svg
      class="w-4 h-4 nm-animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  {/if}
  {@render children()}
</button>

<style>
  /* Additional variant: danger (not in base CSS) */
  :global(.nm-btn-danger) {
    background: var(--nm-error);
    color: white;
  }

  :global(.nm-btn-danger:hover:not(:disabled)) {
    background: #dc2626;
    box-shadow: var(--nm-shadow-sm);
    transform: translateY(-1px);
  }
</style>

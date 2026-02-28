<!-- =========================================================================
CARD COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Versatile card component with subtle elevation.

FEATURES:
- Hover lift effect with scale(1.02)
- Multiple variants (default, flat, elevated)
- Optional header, body, footer sections
- Accessible focus states
- Smooth transitions
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    variant?: "default" | "flat" | "elevated" | "outlined";
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
    clickable?: boolean;
    onClick?: () => void;
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
    class?: string;
  };

  let {
    variant = "default",
    padding = "md",
    hover = true,
    clickable = false,
    onClick,
    header,
    children,
    footer,
    class: className = "",
  }: Props = $props();

  const variantClasses = {
    default: "nm-card",
    flat: "nm-card-flat",
    elevated: "nm-card-elevated",
    outlined: "nm-card-outlined",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  function handleKeyDown(e: KeyboardEvent) {
    if (clickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  }
</script>

<div
  class="
    {variantClasses[variant]}
    {paddingClasses[padding]}
    {hover ? 'nm-card-hover' : ''}
    {clickable ? 'nm-card-clickable' : ''}
    {className}
  "
  role={clickable ? "button" : undefined}
  tabindex={clickable ? 0 : undefined}
  onclick={onClick}
  onkeydown={handleKeyDown}
>
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {/if}

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  /* Card variants */
  .nm-card {
    background: var(--nm-bg-elevated);
    border: 1px solid var(--nm-border);
    border-radius: var(--nm-radius-lg);
    box-shadow: var(--nm-shadow-sm);
    transition: all var(--nm-duration-normal) var(--nm-easing-smooth);
  }

  .nm-card-flat {
    background: var(--nm-bg-secondary);
    border: none;
    border-radius: var(--nm-radius-lg);
    box-shadow: none;
  }

  .nm-card-elevated {
    background: var(--nm-bg-elevated);
    border: 1px solid var(--nm-border);
    border-radius: var(--nm-radius-lg);
    box-shadow: var(--nm-shadow-md);
  }

  .nm-card-outlined {
    background: transparent;
    border: 1px solid var(--nm-border);
    border-radius: var(--nm-radius-lg);
    box-shadow: none;
  }

  /* Hover effects */
  .nm-card-hover:hover {
    box-shadow: var(--nm-shadow);
    transform: translateY(-2px);
  }

  .nm-card-elevated.nm-card-hover:hover {
    box-shadow: var(--nm-shadow-lg);
    transform: translateY(-2px);
  }

  /* Clickable */
  .nm-card-clickable {
    cursor: pointer;
  }

  .nm-card-clickable:focus-visible {
    outline: 2px solid var(--nm-accent);
    outline-offset: 2px;
  }

  /* Sections */
  .card-header {
    margin: calc(-1 * var(--nm-space-6)) calc(-1 * var(--nm-space-6))
      var(--nm-space-4);
    padding: var(--nm-space-4) var(--nm-space-6);
    border-bottom: 1px solid var(--nm-border);
  }

  .card-body {
    flex: 1;
  }

  .card-footer {
    margin: var(--nm-space-4) calc(-1 * var(--nm-space-6))
      calc(-1 * var(--nm-space-6));
    padding: var(--nm-space-4) var(--nm-space-6);
    border-top: 1px solid var(--nm-border);
    background: var(--nm-bg-secondary);
    border-radius: 0 0 var(--nm-radius-lg) var(--nm-radius-lg);
  }

  /* Adjust for different padding sizes */
  .p-4 .card-header {
    margin: -1rem -1rem var(--nm-space-3);
    padding: var(--nm-space-3) var(--nm-space-4);
  }

  .p-4 .card-footer {
    margin: var(--nm-space-3) -1rem -1rem;
    padding: var(--nm-space-3) var(--nm-space-4);
  }

  .p-8 .card-header {
    margin: -2rem -2rem var(--nm-space-5);
    padding: var(--nm-space-5) 2rem;
  }

  .p-8 .card-footer {
    margin: var(--nm-space-5) -2rem -2rem;
    padding: var(--nm-space-5) 2rem;
  }
</style>

<!-- =========================================================================
NOTEPAD BUTTON COMPONENT
============================================================================ -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
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
    primary: "np-btn np-btn-primary",
    secondary: "np-btn",
    danger: "np-btn bg-red-600 border-red-600 text-white hover:bg-red-700",
    ghost: "np-btn border-transparent hover:bg-[var(--np-bg-secondary)]",
  };

  const sizeClasses = {
    sm: "np-btn-sm",
    md: "",
    lg: "py-3 px-6",
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  aria-busy={loading}
  class="{variantClasses[variant]} {sizeClasses[size]} {fullWidth
    ? 'w-full'
    : ''} {className}"
  {...restProps}
>
  {#if loading}
    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
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

<!-- =========================================================================
NOTEPAD BUTTON COMPONENT - M3 Expressive Design
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "tonal";
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
    primary: `
      bg-[var(--m3-primary)] text-[var(--m3-on-primary)]
      hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-on-primary-container)]
      active:scale-[0.98]
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-transparent text-[var(--m3-on-surface)]
      hover:bg-[var(--m3-surface-variant)]
      border-2 border-[var(--m3-outline)]
    `,
    danger: `
      bg-[var(--m3-error)] text-[var(--m3-on-error)]
      hover:bg-[var(--m3-error-container)] hover:text-[var(--m3-on-error)]
      active:scale-[0.98]
      shadow-sm
    `,
    ghost: `
      bg-transparent text-[var(--m3-on-surface)]
      hover:bg-[var(--m3-surface-variant)]
    `,
    tonal: `
      bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]
      hover:bg-[var(--m3-tertiary-container)] hover:text-[var(--m3-on-tertiary-container)]
      active:scale-[0.98]
    `,
  };

  const sizeClasses = {
    sm: "text-sm px-3.5 py-2 rounded-lg gap-1.5",
    md: "text-base px-5 py-2.5 rounded-full gap-2",
    lg: "text-lg px-7 py-3.5 rounded-full gap-2.5",
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  aria-busy={loading}
  class="
    inline-flex items-center justify-center
    font-medium select-none
    transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--m3-primary-container)]/40
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    {variantClasses[variant]}
    {sizeClasses[size]}
    {fullWidth ? 'w-full' : ''}
    {className}
  "
  {...restProps}
>
  {#if loading}
    <svg
      class="h-4 w-4 animate-spin"
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

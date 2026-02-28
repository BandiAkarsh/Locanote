<!-- =========================================================================
BUTTON COMPONENT - M3 Expressive Design with Beautiful Micro-interactions
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "tonal";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    ripple?: boolean;
    children: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled = false,
    ripple = true,
    type = "button",
    children,
    class: className = "",
    ...restProps
  }: Props = $props();

  let buttonRef: HTMLButtonElement;

  function handleClick(event: MouseEvent) {
    if (!ripple || disabled || loading) return;

    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const circle = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x - radius}px`;
    circle.style.top = `${y - radius}px`;
    circle.classList.add("ripple-effect");

    const existingRipple = button.querySelector(".ripple-effect");
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(circle);

    setTimeout(() => {
      circle.remove();
    }, 600);
  }

  const variantClasses = {
    primary: `
      bg-[var(--m3-primary)] text-[var(--m3-on-primary)]
      hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-on-primary-container)]
      shadow-sm hover:shadow-lg hover:shadow-[var(--m3-primary)]/20
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-transparent text-[var(--m3-on-surface)]
      hover:bg-[var(--m3-surface-variant)]
      border-2 border-[var(--m3-outline)]
      hover:border-[var(--m3-primary)]
      hover:-translate-y-0.5
    `,
    danger: `
      bg-[var(--m3-error)] text-[var(--m3-on-error)]
      hover:bg-[var(--m3-error-container)] hover:text-[var(--m3-on-error)]
      shadow-sm hover:shadow-lg hover:shadow-[var(--m3-error)]/20
      hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-[var(--m3-on-surface)]
      hover:bg-[var(--m3-surface-variant)]
      hover:-translate-y-0.5
    `,
    tonal: `
      bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]
      hover:bg-[var(--m3-tertiary-container)] hover:text-[var(--m3-on-tertiary-container)]
      hover:-translate-y-0.5
    `,
  };

  const sizeClasses = {
    sm: "text-sm px-3.5 py-2 rounded-lg gap-1.5",
    md: "text-base px-5 py-2.5 rounded-full gap-2",
    lg: "text-lg px-7 py-3.5 rounded-full gap-2.5",
  };
</script>

<button
  bind:this={buttonRef}
  {type}
  disabled={disabled || loading}
  aria-busy={loading}
  onclick={handleClick}
  class="
    relative overflow-hidden
    inline-flex items-center justify-center
    font-medium select-none
    transition-all duration-200 ease-out
    active:scale-[0.96]
    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--m3-primary-container)]/40
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    disabled:hover:transform-none disabled:hover:shadow-none
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

<style>
  button {
    transform-style: preserve-3d;
  }

  :global(.ripple-effect) {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
</style>

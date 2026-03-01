<!-- =========================================================================
MODAL COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Clean modal overlay with smooth animations.

FEATURES:
- Backdrop blur effect
- Smooth scale-in animation
- Accessible (ESC to close, focus trap)
- Customizable header, body, footer
- Backdrop click to close (optional)
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    open?: boolean;
    title?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    onEnter?: () => void;
    type?: "dialog" | "modal";
    children: Snippet;
    footer?: Snippet;
  };

  let {
    open = $bindable(false),
    title,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onEnter,
    type = "dialog",
    children,
    footer,
  }: Props = $props();

  let dialogRef: HTMLDialogElement;

  $effect(() => {
    if (!dialogRef) return;

    if (open && !dialogRef.open) {
      dialogRef.showModal();
    } else if (!open && dialogRef.open) {
      dialogRef.close();
    }
  });

  function handleBackdropClick(event: MouseEvent) {
    if (!closeOnBackdrop) return;

    const rect = dialogRef.getBoundingClientRect();
    const isOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (isOutside) {
      open = false;
    }
  }

  function handleClose() {
    open = false;
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (open) {
      if (e.key === "Escape" && closeOnEscape) {
        open = false;
      }
      if (e.key === "Enter" && onEnter && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (
          target &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          onEnter();
        }
      }
    }
  }}
/>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogRef}
  onclick={handleBackdropClick}
  onclose={handleClose}
  tabindex="-1"
  class="nm-modal"
>
  <div class="nm-modal-header">
    {#if title}
      <h2 class="nm-modal-title">{title}</h2>
    {:else}
      <div></div>
    {/if}
    <button
      type="button"
      onclick={() => (open = false)}
      class="nm-btn nm-btn-icon nm-btn-ghost"
      aria-label="Close"
    >
      <svg
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
  <div class="nm-modal-body">
    {@render children()}
  </div>
  {#if footer}
    <div class="nm-modal-footer">
      {@render footer()}
    </div>
  {/if}
</dialog>

<style>
  dialog {
    border: none;
    border-radius: var(--nm-radius-xl);
    padding: 0;
    max-width: 480px;
    width: 90vw;
    max-height: 90vh;
    background: var(--nm-bg-elevated);
    color: var(--nm-text-primary);
    box-shadow: var(--nm-shadow-xl);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    animation: nm-fade-in var(--nm-duration-fast) var(--nm-easing-smooth)
      forwards;
  }

  dialog[open] {
    animation: nm-scale-in var(--nm-duration-normal) var(--nm-easing-bounce)
      forwards;
  }

  /* Override base styles */
  dialog :global(.nm-modal-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nm-space-5) var(--nm-space-6);
    border-bottom: 1px solid var(--nm-border);
  }

  dialog :global(.nm-modal-title) {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--nm-text-primary);
    margin: 0;
  }

  dialog :global(.nm-modal-body) {
    padding: var(--nm-space-6);
    overflow-y: auto;
    max-height: 60vh;
  }

  dialog .nm-modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--nm-space-3);
    padding: var(--nm-space-4) var(--nm-space-6);
    border-top: 1px solid var(--nm-border);
    background: var(--nm-bg-secondary);
  }

  dialog .nm-modal-footer:empty {
    display: none;
  }
</style>

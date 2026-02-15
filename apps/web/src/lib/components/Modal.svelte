<!-- =========================================================================
NOTEPAD MODAL COMPONENT
============================================================================ -->

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
  };

  let {
    open = $bindable(false),
    title,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onEnter,
    type = "dialog",
    children,
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

  $effect(() => {
    if (open && dialogRef) {
      const focusable = dialogRef.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }
  });

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
  class="np-modal"
>
  <div class="np-modal-header">
    {#if title}
      <h2 class="np-modal-title">{title}</h2>
    {:else}
      <div></div>
    {/if}
    <button
      type="button"
      onclick={() => (open = false)}
      class="text-[var(--np-text-muted)] hover:text-[var(--np-text)] p-1"
      aria-label="Close"
    >
      <svg
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
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
  <div class="np-modal-body">
    {@render children()}
  </div>
</dialog>

<style>
  dialog {
    border: none;
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    width: 90vw;
    max-height: 90vh;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  dialog[open] {
    animation: fade-in 0.15s ease-out;
  }

  dialog[open]::backdrop {
    animation: fade-in 0.15s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

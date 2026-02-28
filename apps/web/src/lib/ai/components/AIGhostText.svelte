<!--
  AIGhostText.svelte
  
  Inline completion suggestions (like GitHub Copilot)
  Appears as faded text after cursor position
-->
<script lang="ts">
  import { onMount, tick } from "svelte";

  interface Props {
    visible: boolean;
    suggestion: string;
    targetElement: HTMLElement | null;
    onAccept: () => void;
    onDismiss: () => void;
  }

  let { visible, suggestion, targetElement, onAccept, onDismiss }: Props =
    $props();

  let ghostElement = $state<HTMLDivElement | null>(null);
  let position = $state({ x: 0, y: 0 });

  $effect(() => {
    if (visible && targetElement && ghostElement) {
      updatePosition();
    }
  });

  function updatePosition() {
    if (!targetElement || !ghostElement) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    position = {
      x: rect.left - targetRect.left,
      y: rect.top - targetRect.top,
    };
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!visible) return;

    if (event.key === "Tab") {
      event.preventDefault();
      onAccept();
    } else if (event.key === "Escape") {
      onDismiss();
    } else if (event.key.length === 1) {
      // Typing dismisses ghost text
      onDismiss();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

{#if visible && suggestion}
  <div
    bind:this={ghostElement}
    class="ghost-text"
    style="left: {position.x}px; top: {position.y}px;"
    role="status"
    aria-label="AI suggestion: {suggestion}. Press Tab to accept, Escape to dismiss."
  >
    <span class="ghost-content">{suggestion}</span>
    <span class="ghost-hint">Tab</span>
  </div>
{/if}

<style>
  .ghost-text {
    position: absolute;
    pointer-events: none;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: pre;
  }

  .ghost-content {
    color: var(--ui-text-muted);
    opacity: 0.6;
    font-style: italic;
  }

  .ghost-hint {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    background: var(--ui-surface-elevated);
    border: 1px solid var(--ui-border);
    border-radius: 0.25rem;
    color: var(--ui-text-muted);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .ghost-text:hover .ghost-hint {
    opacity: 1;
  }

  /* Animation for appearing */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .ghost-text {
    animation: fadeIn 0.15s ease-out;
  }
</style>

<!-- =========================================================================
NOTE LIST COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Clean, minimal list of notes with search and filtering.

FEATURES:
- Staggered animations on load
- Hover effects with scale(1.02)
- Search filtering
- Empty state
- Note actions (delete, share)
======================================================================== -->

<script lang="ts">
  import type { Note } from "$db";

  /**
   * Format a date as a relative time string (e.g., "2 hours ago")
   */
  function formatDistanceToNow(date: Date | number | string): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  type Props = {
    notes: Note[];
    activeNoteId?: string;
    isLoading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    onSelect: (note: Note) => void;
    onDelete?: (note: Note) => void;
    onCreate?: () => void;
    class?: string;
  };

  let {
    notes,
    activeNoteId,
    isLoading = false,
    emptyTitle = "No notes yet",
    emptyDescription = "Create your first note to get started",
    onSelect,
    onDelete,
    onCreate,
    class: className = "",
  }: Props = $props();

  function handleKeyDown(e: KeyboardEvent, note: Note) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(note);
    }
  }

  function handleDelete(e: MouseEvent, note: Note) {
    e.stopPropagation();
    onDelete?.(note);
  }
</script>

<div class="note-list {className}">
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading notes...</span>
    </div>
  {:else if notes.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 class="empty-title">{emptyTitle}</h3>
      <p class="empty-description">{emptyDescription}</p>
      {#if onCreate}
        <button class="nm-btn nm-btn-primary" onclick={onCreate}>
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Create your first note
        </button>
      {/if}
    </div>
  {:else}
    <ul class="notes" role="list">
      {#each notes as note, index (note.id)}
        <li
          class="note-item"
          class:active={note.id === activeNoteId}
          style:animation-delay="{index * 50}ms"
          role="button"
          tabindex="0"
          onclick={() => onSelect(note)}
          onkeydown={(e) => handleKeyDown(e, note)}
        >
          <div class="note-content">
            <h4 class="note-title">
              {note.title || "Untitled Note"}
            </h4>
            <p class="note-meta">
              {formatDistanceToNow(note.updatedAt)}
            </p>
          </div>

          {#if onDelete}
            <button
              class="note-delete"
              onclick={(e) => handleDelete(e, note)}
              aria-label="Delete note"
              tabindex="-1"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .note-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--nm-space-2);
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--nm-space-12);
    gap: var(--nm-space-4);
    color: var(--nm-text-secondary);
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--nm-border);
    border-top-color: var(--nm-accent);
    border-radius: 50%;
    animation: nm-spin 0.8s linear infinite;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--nm-space-12) var(--nm-space-6);
    text-align: center;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--nm-text-tertiary);
    margin-bottom: var(--nm-space-4);
  }

  .empty-icon svg {
    width: 100%;
    height: 100%;
  }

  .empty-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nm-text-primary);
    margin-bottom: var(--nm-space-2);
  }

  .empty-description {
    font-size: 0.875rem;
    color: var(--nm-text-secondary);
    margin-bottom: var(--nm-space-6);
    max-width: 280px;
  }

  /* Notes list */
  .notes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-1);
  }

  .note-item {
    display: flex;
    align-items: center;
    gap: var(--nm-space-3);
    padding: var(--nm-space-3);
    border-radius: var(--nm-radius);
    cursor: pointer;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
    animation: nm-fade-up var(--nm-duration-normal) var(--nm-easing-decelerate)
      forwards;
    opacity: 0;
    transform: translateY(12px);
  }

  .note-item:hover {
    background: var(--nm-accent-muted);
    transform: scale(1.02);
  }

  .note-item.active {
    background: var(--nm-accent-subtle);
  }

  .note-item:focus-visible {
    outline: 2px solid var(--nm-accent);
    outline-offset: 2px;
  }

  .note-content {
    flex: 1;
    min-width: 0;
  }

  .note-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--nm-text-primary);
    margin: 0 0 var(--nm-space-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-item.active .note-title {
    color: var(--nm-accent);
  }

  .note-meta {
    font-size: 0.75rem;
    color: var(--nm-text-tertiary);
    margin: 0;
  }

  .note-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: var(--nm-text-tertiary);
    background: transparent;
    border: none;
    border-radius: var(--nm-radius-sm);
    cursor: pointer;
    opacity: 0;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
  }

  .note-item:hover .note-delete {
    opacity: 1;
  }

  .note-delete:hover {
    color: var(--nm-error);
    background: var(--nm-error-light);
  }

  .note-delete svg {
    width: 16px;
    height: 16px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .note-item {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>

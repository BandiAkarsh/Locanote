<!-- =========================================================================
DASHBOARD - 2026 Neo-Minimalist Design
========================================================================
Clean three-panel dashboard layout with sidebar, content, and detail areas.

FEATURES:
- Three-panel layout (sidebar, list, detail)
- Search functionality
- Note creation
- Clean, minimal design
- Responsive
======================================================================== -->

<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$stores";
  import { Button, Modal, NoteList, Card } from "$components";
  import {
    createNewNote,
    getUserNotes,
    deleteUserNote,
  } from "$lib/services/notes.svelte";
  import type { Note } from "$db";

  let notes = $state<Note[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let noteToDelete = $state<Note | null>(null);
  let isDeleteModalOpen = $state(false);

  let filteredNotes = $derived(
    searchQuery
      ? notes.filter((n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : notes,
  );

  onMount(() => {
    loadNotes();
  });

  async function loadNotes() {
    try {
      isLoading = true;
      notes = await getUserNotes();
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateNote() {
    const newNote = await createNewNote("Untitled Note");
    goto(`/app/note/${newNote.id}`);
  }

  function openNote(note: Note) {
    goto(`/app/note/${note.id}`);
  }

  function confirmDelete(note: Note) {
    noteToDelete = note;
    isDeleteModalOpen = true;
  }

  async function handleDelete() {
    if (!noteToDelete) return;
    await deleteUserNote(noteToDelete.id);
    notes = notes.filter((n) => n.id !== noteToDelete!.id);
    noteToDelete = null;
    isDeleteModalOpen = false;
  }

  function handleLogout() {
    auth.logout();
    goto("/");
  }
</script>

<div class="nm-dashboard">
  <!-- Sidebar -->
  <aside class="nm-dashboard-sidebar">
    <!-- Brand Header -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <span class="brand-name">Locanote</span>
    </div>

    <!-- Create Button -->
    <div class="sidebar-actions">
      <button
        class="nm-btn nm-btn-primary nm-btn-full"
        onclick={handleCreateNote}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>
    </div>

    <!-- Search -->
    <div class="sidebar-search">
      <div class="nm-input-wrapper">
        <svg
          class="nm-input-icon w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          bind:value={searchQuery}
          class="nm-input nm-input-with-icon"
        />
      </div>
    </div>

    <!-- Note List -->
    <div class="sidebar-list">
      <NoteList
        notes={filteredNotes}
        {isLoading}
        onSelect={openNote}
        onDelete={confirmDelete}
        onCreate={handleCreateNote}
        emptyTitle="No notes found"
        emptyDescription={searchQuery
          ? "Try a different search term"
          : "Create your first note to get started"}
      />
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-stats">
        <span class="stats-count"
          >{notes.length} note{notes.length !== 1 ? "s" : ""}</span
        >
      </div>
      <button class="nm-btn nm-btn-ghost nm-btn-sm" onclick={handleLogout}>
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Sign out
      </button>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="nm-dashboard-main">
    <div class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <h2 class="empty-title">Select a note to view or edit</h2>
      <p class="empty-description">
        Choose a note from the sidebar, or create a new one to get started.
      </p>
      <button class="nm-btn nm-btn-primary" onclick={handleCreateNote}>
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 4v16m8-8H4" />
        </svg>
        Create New Note
      </button>
    </div>
  </main>
</div>

<!-- Delete Confirmation Modal -->
<Modal bind:open={isDeleteModalOpen} title="Delete Note?">
  {#if noteToDelete}
    <div class="delete-confirmation">
      <p class="delete-message">
        Are you sure you want to delete <strong
          >"{noteToDelete.title || "Untitled Note"}"</strong
        >?
      </p>
      <p class="delete-warning">This action cannot be undone.</p>
    </div>
  {/if}

  {#snippet footer()}
    <div class="delete-modal-footer">
      <button
        class="delete-btn-cancel"
        onclick={() => (isDeleteModalOpen = false)}
      >
        Cancel
      </button>
      <button class="delete-btn-confirm" onclick={handleDelete}>
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
        Delete
      </button>
    </div>
  {/snippet}
</Modal>

<style>
  /* Sidebar Styles */
  .sidebar-brand {
    height: var(--nm-header-height);
    display: flex;
    align-items: center;
    gap: var(--nm-space-3);
    padding: 0 var(--nm-space-5);
    border-bottom: 1px solid var(--nm-border);
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    color: var(--nm-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-logo svg {
    width: 100%;
    height: 100%;
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--nm-text-primary);
  }

  .sidebar-actions {
    padding: var(--nm-space-4);
    border-bottom: 1px solid var(--nm-border);
  }

  .sidebar-search {
    padding: var(--nm-space-4);
    border-bottom: 1px solid var(--nm-border);
  }

  .sidebar-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar-footer {
    padding: var(--nm-space-4);
    border-top: 1px solid var(--nm-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-stats {
    display: flex;
    align-items: center;
    gap: var(--nm-space-2);
  }

  .stats-count {
    font-size: 0.875rem;
    color: var(--nm-text-secondary);
  }

  /* Empty State */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--nm-space-12);
    text-align: center;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    color: var(--nm-text-tertiary);
    margin-bottom: var(--nm-space-6);
    opacity: 0.5;
  }

  .empty-icon svg {
    width: 100%;
    height: 100%;
  }

  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--nm-text-primary);
    margin-bottom: var(--nm-space-2);
  }

  .empty-description {
    font-size: 0.9375rem;
    color: var(--nm-text-secondary);
    margin-bottom: var(--nm-space-6);
    max-width: 400px;
  }

  /* Delete Confirmation */
  .delete-confirmation {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-2);
  }

  .delete-message {
    font-size: 0.9375rem;
    color: var(--nm-text-primary);
    line-height: 1.5;
  }

  .delete-message strong {
    font-weight: 600;
  }

  .delete-warning {
    font-size: 0.875rem;
    color: var(--nm-error);
  }

  /* Delete Modal Footer */
  .delete-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--nm-border);
    background: var(--nm-bg-secondary);
  }

  .delete-btn-cancel {
    padding: 8px 16px;
    border: 1px solid var(--nm-border);
    border-radius: var(--nm-radius-md);
    background: var(--nm-bg-primary);
    color: var(--nm-text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn-cancel:hover {
    background: var(--nm-bg-secondary);
  }

  .delete-btn-confirm {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--nm-radius-md);
    background: #ef4444;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn-confirm:hover {
    background: #dc2626;
  }

  .delete-btn-confirm svg {
    width: 16px;
    height: 16px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .nm-dashboard-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform var(--nm-duration-normal) var(--nm-easing-smooth);
    }

    .nm-dashboard-sidebar.open {
      transform: translateX(0);
    }
  }
</style>

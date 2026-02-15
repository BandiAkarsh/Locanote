<!-- =========================================================================
NOTEPAD DASHBOARD - Sidebar + Main Area
============================================================================ -->

<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$stores";
  import { Button, Modal } from "$components";
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

  function openNote(noteId: string) {
    goto(`/app/note/${noteId}`);
  }

  function confirmDelete(note: Note, event: MouseEvent) {
    event.stopPropagation();
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

<div class="np-container">
  <!-- Sidebar -->
  <aside class="np-sidebar">
    <div class="np-sidebar-header">
      <span class="np-sidebar-title">My Notes</span>
      <button
        class="np-btn np-btn-primary np-btn-sm"
        onclick={handleCreateNote}
        aria-label="Create new note"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <div class="p-3 border-b border-[var(--np-border)]">
      <div class="np-search">
        <svg
          class="np-search-icon w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          bind:value={searchQuery}
        />
      </div>
    </div>

    <div class="np-note-list">
      {#if isLoading}
        <div class="p-4 text-center text-[var(--np-text-muted)] text-sm">
          Loading...
        </div>
      {:else if filteredNotes.length === 0}
        <div class="np-empty">
          <svg
            class="np-empty-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-sm">
            {searchQuery ? "No notes found" : "No notes yet"}
          </p>
          {#if !searchQuery}
            <button
              class="np-btn np-btn-primary mt-4"
              onclick={handleCreateNote}
            >
              Create your first note
            </button>
          {/if}
        </div>
      {:else}
        {#each filteredNotes as note}
          <div
            class="np-note-item"
            onclick={() => openNote(note.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === "Enter" && openNote(note.id)}
          >
            <div class="np-flex np-justify-between np-items-center">
              <div class="flex-1 min-w-0">
                <div class="np-note-title">{note.title || "Untitled Note"}</div>
                <div class="np-note-date">
                  {new Date(note.updatedAt).toLocaleDateString()} at {new Date(
                    note.updatedAt,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <button
                class="np-btn np-btn-icon opacity-0 group-hover:opacity-100"
                onclick={(e) => confirmDelete(note, e)}
                title="Delete note"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="p-3 border-t border-[var(--np-border)] bg-[var(--np-bg)]">
      <div class="flex items-center justify-between">
        <span class="text-sm text-[var(--np-text-muted)]">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
        <button
          class="text-sm text-[var(--np-accent)] hover:underline"
          onclick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="np-main">
    <div
      class="h-full flex items-center justify-center text-[var(--np-text-muted)]"
    >
      <div class="text-center">
        <svg
          class="w-16 h-16 mx-auto mb-4 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <p class="text-lg mb-2">Select a note to view or edit</p>
        <p class="text-sm">or</p>
        <button class="np-btn np-btn-primary mt-4" onclick={handleCreateNote}>
          Create New Note
        </button>
      </div>
    </div>
  </main>
</div>

<!-- Delete Modal -->
<Modal bind:open={isDeleteModalOpen} title="Delete Note?" type="dialog">
  {#if noteToDelete}
    <div class="space-y-4">
      <p class="text-[var(--np-text)]">
        Are you sure you want to delete <strong>"{noteToDelete.title}"</strong>?
        This action cannot be undone.
      </p>
      <div class="flex gap-2 justify-end">
        <button class="np-btn" onclick={() => (isDeleteModalOpen = false)}>
          Cancel
        </button>
        <button
          class="np-btn np-btn-primary bg-red-600 border-red-600 hover:bg-red-700"
          onclick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  {/if}
</Modal>

<style>
  .np-note-item:hover .np-btn-icon {
    opacity: 1;
  }
</style>

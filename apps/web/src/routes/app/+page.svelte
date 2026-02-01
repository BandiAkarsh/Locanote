<!-- =========================================================================
APP DASHBOARD (+page.svelte for /app)
============================================================================
The main dashboard page shown after successful authentication.
Features:
- Create new notes
- List all user's notes
- Navigate to note editor
- Quick actions
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$stores/auth.svelte';
  import { createNewNote, getUserNotes, deleteUserNote } from '$lib/services/notes.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Note } from '$db';

  // Local state
  let notes = $state<Note[]>([]);
  let isLoading = $state(true);
  let isCreating = $state(false);
  let noteToDelete = $state<Note | null>(null);

  // Load notes on mount
  onMount(async () => {
    await loadNotes();
  });

  // Load user's notes
  async function loadNotes() {
    try {
      isLoading = true;
      notes = await getUserNotes();
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      isLoading = false;
    }
  }

  // Create a new note
  async function handleCreateNote() {
    try {
      isCreating = true;
      const newNote = await createNewNote('Untitled Note');
      notes = [newNote, ...notes];
      // Navigate to the new note
      goto(`/app/note/${newNote.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      isCreating = false;
    }
  }

  // Open a note
  function openNote(noteId: string) {
    goto(`/app/note/${noteId}`);
  }

  // Confirm delete
  function confirmDelete(note: Note, event: Event) {
    event.stopPropagation();
    noteToDelete = note;
  }

  // Delete note
  async function handleDelete() {
    if (!noteToDelete) return;
    
    try {
      await deleteUserNote(noteToDelete.id);
      notes = notes.filter(n => n.id !== noteToDelete!.id);
      noteToDelete = null;
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  }

  // Format date
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Locanote</title>
</svelte:head>

<div class="space-y-6">
  <!-- Welcome Section -->
  <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
    <h1 class="text-3xl font-bold mb-2">
      Welcome back{auth.session?.username ? `, ${auth.session.username}` : ''}!
    </h1>
    <p class="text-indigo-100">
      Your notes are securely stored on your device and synced in real-time.
    </p>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Create Note -->
    <button 
      class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={handleCreateNote}
      disabled={isCreating}
    >
      <div class="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {#if isCreating}
          <div class="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        {:else}
          <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        {/if}
      </div>
      <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
        {isCreating ? 'Creating...' : 'Create Note'}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">Start a new collaborative note</p>
    </button>

    <!-- View Notes -->
    <button class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all text-left group">
      <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900 dark:text-white mb-1">My Notes</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
      </p>
    </button>

    <!-- Settings -->
    <button class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-400 hover:shadow-lg transition-all text-left group">
      <div class="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Settings</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">Manage your account</p>
    </button>
  </div>

  <!-- Notes List -->
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">My Notes</h2>
      {#if notes.length > 0}
        <span class="text-sm text-gray-500 dark:text-gray-400">{notes.length} total</span>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Loading notes...</span>
        </div>
      </div>
    {:else if notes.length === 0}
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Create your first note to get started!</p>
        <Button onclick={handleCreateNote} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Note'}
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each notes as note (note.id)}
          <div 
            class="group relative p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
            onclick={() => openNote(note.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && openNote(note.id)}
          >
            <!-- Delete Button -->
            <button 
              class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              onclick={(e) => confirmDelete(note, e)}
              title="Delete note"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <h3 class="font-semibold text-gray-900 dark:text-white mb-1 pr-8">{note.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Updated {formatDate(note.updatedAt)}
            </p>
            
            {#if note.tags.length > 0}
              <div class="flex flex-wrap gap-1 mt-2">
                {#each note.tags.slice(0, 3) as tag}
                  <span class="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    {tag}
                  </span>
                {/each}
                {#if note.tags.length > 3}
                  <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full">
                    +{note.tags.length - 3}
                  </span>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if noteToDelete}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Note?</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete "{noteToDelete.title}"? This action cannot be undone.
      </p>
      <div class="flex gap-3 justify-end">
        <Button variant="ghost" onclick={() => noteToDelete = null}>Cancel</Button>
        <Button variant="danger" onclick={handleDelete}>Delete</Button>
      </div>
    </div>
  </div>
{/if}

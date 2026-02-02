<!-- =========================================================================
APP DASHBOARD (+page.svelte for /app)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$stores/auth.svelte';
  import { createNewNote, getUserNotes, deleteUserNote } from '$lib/services/notes.svelte';
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import type { Note } from '$db';

  // Local state
  let notes = $state<Note[]>([]);
  let isLoading = $state(true);
  let isCreating = $state(false);
  let noteToDelete = $state<Note | null>(null);
  let isDeleteModalOpen = $state(false);

  $effect(() => {
    isDeleteModalOpen = !!noteToDelete;
  });

  function closeDeleteModal() {
    noteToDelete = null;
  }

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
      goto(`/app/note/${newNote.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      isCreating = false;
    }
  }

  function openNote(noteId: string) {
    goto(`/app/note/${noteId}`);
  }

  function confirmDelete(note: Note, event: Event) {
    event.stopPropagation();
    noteToDelete = note;
  }

  async function handleDelete() {
    if (!noteToDelete) return;
    try {
      await deleteUserNote(noteToDelete.id);
      notes = notes.filter(n => n.id !== noteToDelete!.id);
      noteToDelete = null;
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Dashboard - Locanote</title>
</svelte:head>

<div class="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pb-20">
  <!-- Welcome Section -->
  <div class="bg-brand-gradient rounded-3xl p-8 text-white shadow-xl glow-border">
    <h1 class="text-4xl font-extrabold mb-2 tracking-tight">
      Welcome back{auth.session?.username ? `, ${auth.session.username}` : ''}!
    </h1>
    <p class="text-white/80 font-medium">
      Your workspace is ready. Collaborate and create without boundaries.
    </p>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Create Note -->
    <button 
      class="themed-card p-8 hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition-all text-left group disabled:opacity-50"
      onclick={handleCreateNote}
      disabled={isCreating}
    >
      <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {#if isCreating}
          <div class="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        {:else}
          <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        {/if}
      </div>
      <h3 class="text-xl font-bold text-[var(--ui-text)] mb-2">
        {isCreating ? 'Creating...' : 'Create Note'}
      </h3>
      <p class="text-sm text-[var(--ui-text-muted)]">Start a new collaborative document</p>
    </button>

    <!-- View Count Card -->
    <div class="themed-card p-8">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-[var(--ui-text)] mb-2">My Library</h3>
      <p class="text-sm text-[var(--ui-text-muted)]">
        {notes.length} saved {notes.length === 1 ? 'note' : 'notes'}
      </p>
    </div>

    <!-- Settings Card -->
    <button 
      onclick={() => goto('/app/settings')}
      class="themed-card p-8 hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
    >
      <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-[var(--ui-text)] mb-2">Preferences</h3>
      <p class="text-sm text-[var(--ui-text-muted)]">Customize your themes and account</p>
    </button>
  </div>

  <!-- Notes List -->
  <div class="themed-card p-8">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-[var(--ui-text)] tracking-tight">Recent Notes</h2>
      {#if notes.length > 0}
        <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">{notes.length} Items</span>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    {:else if notes.length === 0}
      <div class="text-center py-20 bg-[var(--ui-bg)] rounded-2xl border-2 border-dashed border-[var(--ui-border)]">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--ui-surface)] flex items-center justify-center shadow-inner">
          <svg class="w-10 h-10 text-[var(--ui-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--ui-text)] mb-2">No notes found</h3>
        <p class="text-[var(--ui-text-muted)] mb-8">Your ideas need a home. Create your first note now.</p>
        <Button size="lg" onclick={handleCreateNote} disabled={isCreating}>
          Create First Note
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each notes as note (note.id)}
          <div 
            class="group relative p-6 bg-[var(--ui-bg)] hover:bg-[var(--ui-surface)] rounded-2xl border border-[var(--ui-border)] hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            onclick={() => openNote(note.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && openNote(note.id)}
          >
            <!-- Background Accent Blob -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>

            <button 
              class="absolute top-4 right-4 p-2 text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
              onclick={(e) => confirmDelete(note, e)}
              title="Delete note"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <h3 class="text-lg font-bold text-[var(--ui-text)] mb-2 pr-8 truncate group-hover:text-primary transition-colors">{note.title}</h3>
            <p class="text-xs font-bold uppercase tracking-widest text-[var(--ui-text-muted)]">
              {formatDate(note.updatedAt)}
            </p>
            
            {#if note.tags.length > 0}
              <div class="flex flex-wrap gap-2 mt-4">
                {#each note.tags.slice(0, 2) as tag}
                  <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-tighter bg-primary/10 text-primary rounded-md border border-primary/20">
                    {tag}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<Modal
  bind:open={isDeleteModalOpen}
  title="Delete Note?"
>
  {#if noteToDelete}
    <div class="space-y-4">
      <p class="text-[var(--ui-text)] opacity-80 font-medium">
        Are you sure you want to permanently delete <span class="text-primary">"{noteToDelete.title}"</span>?
      </p>
      <div class="flex gap-3 justify-end pt-4">
        <Button variant="ghost" onclick={closeDeleteModal}>Cancel</Button>
        <Button variant="danger" onclick={handleDelete}>Confirm Delete</Button>
      </div>
    </div>
  {/if}
</Modal>

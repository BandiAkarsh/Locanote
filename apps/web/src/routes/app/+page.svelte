<!-- =========================================================================
APP DASHBOARD (+page.svelte for /app)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$stores/auth.svelte';
  import { createNewNote, getUserNotes, deleteUserNote } from '$lib/services/notes.svelte';
  import { Button, Modal } from '$components';
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

<div class="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pb-24 sm:pb-10">
  <!-- Welcome Section -->
  <div class="bg-brand-gradient rounded-[2rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
    <!-- Decorative background patterns -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
    
    <div class="relative z-10">
      <h1 class="text-3xl sm:text-5xl font-black mb-3 tracking-tighter">
        Welcome back{auth.session?.username ? `, ${auth.session.username}` : ''}!
      </h1>
      <p class="text-white/80 font-bold max-w-md text-sm sm:text-lg">
        Securely capture and collaborate. Your data is yours alone.
      </p>
    </div>
  </div>

  <!-- Quick Stats / Actions Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <div class="themed-card p-4 sm:p-6 flex flex-col items-center justify-center text-center">
      <div class="text-2xl sm:text-4xl font-black text-primary mb-1">{notes.length}</div>
      <div class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)]">Notes</div>
    </div>
    
    <button 
      onclick={() => goto('/app/settings')}
      class="themed-card p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform"
    >
      <div class="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-2">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <div class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)]">Settings</div>
    </button>

    <!-- Large Create Button for desktop -->
    <Button 
      class="col-span-2 hidden lg:flex py-6 text-xl" 
      onclick={handleCreateNote} 
      loading={isCreating}
    >
      <svg class="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Create New Note
    </Button>
  </div>

  <!-- Notes List Header -->
  <div class="flex items-center justify-between px-2">
    <h2 class="text-xl sm:text-2xl font-black text-[var(--ui-text)] tracking-tighter uppercase">Recent Notes</h2>
    <div class="h-0.5 flex-1 mx-4 bg-[var(--ui-border)] opacity-30 hidden sm:block"></div>
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  {:else if notes.length === 0}
    <div class="text-center py-16 themed-card border-dashed">
      <h3 class="text-lg font-bold text-[var(--ui-text)] mb-2">No notes yet</h3>
      <p class="text-sm text-[var(--ui-text-muted)] mb-6">Capture your thoughts, they are encrypted and safe.</p>
      <Button onclick={handleCreateNote} loading={isCreating}>Start your first note</Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {#each notes as note (note.id)}
        <div 
          class="themed-card group relative p-5 sm:p-6 hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col min-h-[140px]"
          onclick={() => openNote(note.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && openNote(note.id)}
        >
          <!-- Delete Icon - Persistent on mobile, hover on desktop -->
          <button 
            class="absolute top-3 right-3 p-2 text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all z-20 
                   lg:opacity-0 lg:group-hover:opacity-100"
            onclick={(e) => confirmDelete(note, e)}
            aria-label="Delete note"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <!-- Security Badge if protected -->
          {#if note.isProtected}
            <div class="absolute top-4 left-4" title="Password Protected">
              <svg class="w-3 h-3 text-primary opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          {/if}

          <h3 class="text-lg font-black text-[var(--ui-text)] mb-2 pr-8 truncate group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          
          <div class="mt-auto flex items-center justify-between pt-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-[var(--ui-text-muted)]">
              {formatDate(note.updatedAt)}
            </span>
            
            <div class="flex gap-1">
              {#each note.tags.slice(0, 2) as tag}
                <div class="w-2 h-2 rounded-full bg-primary/30"></div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Mobile Floating Action Button (FAB) -->
<div class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
  <button 
    onclick={handleCreateNote}
    disabled={isCreating}
    class="bg-primary text-white h-14 px-8 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all font-black uppercase tracking-widest glow-border"
  >
    {#if isCreating}
      <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      Creating
    {:else}
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Note
    {/if}
  </button>
</div>

<Modal
  bind:open={isDeleteModalOpen}
  title="Delete Note?"
>
  {#if noteToDelete}
    <div class="space-y-6">
      <div class="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
        <p class="text-[var(--ui-text)] font-bold mb-1">Permanently delete note?</p>
        <p class="text-xs text-[var(--ui-text-muted)]">"{noteToDelete.title}"</p>
      </div>
      <div class="flex gap-3">
        <Button variant="ghost" fullWidth onclick={closeDeleteModal}>Keep it</Button>
        <Button variant="danger" fullWidth onclick={handleDelete}>Delete Forever</Button>
      </div>
    </div>
  {/if}
</Modal>

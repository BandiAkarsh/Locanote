<!-- =========================================================================
NOTE EDITOR PAGE (+page.svelte for /app/note/[id])
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Editor from '$lib/editor/Editor.svelte';
  import Toolbar from '$lib/editor/Toolbar.svelte';
  import Button from '$lib/components/Button.svelte';
  import { getNote, getNoteForCollaboration } from '$lib/services/notes.svelte';
  import { auth } from '$stores/auth.svelte';
  import type { Note } from '$db';

  // Get note ID from URL params
  const noteId = $derived(page.params.id);

  // Local state
  let note = $state<Note | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let editorInstance = $state<any>(null);
  let connectionStatus = $state({ connected: false, peerCount: 0 });

  // User info for collaboration
  const currentUser = $derived({
    name: auth.session?.username || 'Anonymous',
    color: '#6366f1',
    id: auth.session?.userId || 'anonymous'
  });

  // Load note on mount
  onMount(async () => {
    if (!noteId) {
      error = 'Invalid note ID';
      isLoading = false;
      return;
    }
    
    try {
      const loadedNote = await getNoteForCollaboration(noteId);
      if (!loadedNote) {
        error = 'Note not found or you do not have access';
      } else {
        note = loadedNote;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load note';
    } finally {
      isLoading = false;
    }
  });

  function handleEditorUpdate(content: any) {}

  function handleConnectionStatus(status: { connected: boolean; peerCount: number }) {
    connectionStatus = status;
  }

  function handleEditorReady(editor: any) {
    editorInstance = editor;
  }

  function goBack() {
    goto('/app');
  }
</script>

<svelte:head>
  <title>{note ? note.title : 'Note'} - Locanote</title>
</svelte:head>

<div class="flex flex-col h-screen bg-[var(--ui-bg)] transition-colors duration-500">
  <!-- Header -->
  <header class="flex items-center justify-between px-6 py-4 bg-[var(--ui-surface)] border-b border-[var(--ui-border)] backdrop-blur-[var(--ui-blur)] z-30">
    <div class="flex items-center gap-6">
      <Button variant="ghost" size="sm" onclick={goBack} class="hover:bg-primary/10">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Button>
      
      {#if note}
        <div class="flex flex-col">
          <h1 class="text-xl font-bold text-[var(--ui-text)] tracking-tight leading-none mb-1">{note.title}</h1>
          <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-text-muted)]">
            Saved to device
          </span>
        </div>
      {/if}
    </div>

    <!-- Connection Status -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-4 py-2 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-full text-xs font-bold uppercase tracking-tighter">
        <span 
          class="w-2.5 h-2.5 rounded-full shadow-sm {connectionStatus.peerCount > 0 ? 'bg-green-500 animate-pulse' : connectionStatus.connected ? 'bg-amber-500' : 'bg-red-500'}"
        ></span>
        <span class="text-[var(--ui-text)]">
          {#if connectionStatus.peerCount > 0}
            {connectionStatus.peerCount} {connectionStatus.peerCount === 1 ? 'Peer' : 'Peers'}
          {:else if connectionStatus.connected}
            Searching
          {:else}
            Offline
          {/if}
        </span>
      </div>
      
      <Button variant="primary" size="sm" onclick={() => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Share link copied!');
        });
      }}>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="ml-2 hidden sm:inline uppercase tracking-widest text-xs font-black">Share</span>
      </Button>
    </div>
  </header>

  <!-- Toolbar Container -->
  <div class="bg-[var(--ui-surface)] border-b border-[var(--ui-border)] px-4 py-1 z-20 backdrop-blur-[var(--ui-blur)]">
    <Toolbar editor={editorInstance} />
  </div>

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden p-6 lg:p-10 relative">
    {#if isLoading}
      <div class="flex items-center justify-center h-full">
        <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full">
        <div class="themed-card p-10 text-center max-w-md">
          <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/10 flex items-center justify-center">
            <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-black text-[var(--ui-text)] mb-4 uppercase tracking-tighter">Access Denied</h2>
          <p class="text-[var(--ui-text-muted)] mb-8 font-medium">{error}</p>
          <Button fullWidth onclick={goBack}>Return to Safety</Button>
        </div>
      </div>
    {:else if note && noteId}
      <div class="h-full max-w-5xl mx-auto themed-card shadow-2xl p-2">
        <Editor
          noteId={noteId}
          user={currentUser}
          onUpdate={handleEditorUpdate}
          onConnectionStatusChange={handleConnectionStatus}
          onEditorReady={handleEditorReady}
        />
      </div>
    {/if}
  </main>
</div>

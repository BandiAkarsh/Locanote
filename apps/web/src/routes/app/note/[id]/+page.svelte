<!-- =========================================================================
NOTE EDITOR PAGE (+page.svelte for /app/note/[id])
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Editor from '$lib/editor/Editor.svelte';
  import Toolbar from '$lib/editor/Toolbar.svelte';
  import { Button, ShareModal } from '$components';
  import { getNote, getNoteForCollaboration } from '$lib/services/notes.svelte';
  import { auth } from '$stores/auth.svelte';
  import { networkStatus } from '$stores/network.svelte';
  import { isBrowser, base64ToArrayBuffer } from '$utils/browser';
  import { storeRoomKey, hasRoomKey } from '$crypto/e2e';
  import type { Note } from '$db';

  const noteId = $derived(page.params.id);

  let note = $state<Note | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let editorInstance = $state<any>(null);
  let isShareModalOpen = $state(false);

  const currentUser = $derived({
    name: auth.session?.username || 'Anonymous',
    color: '#6366f1',
    id: auth.session?.userId || 'anonymous'
  });

  onMount(async () => {
    if (!noteId) {
      error = 'Invalid note ID';
      isLoading = false;
      return;
    }

    // --------------------------------------------------------------------
    // EXTRACT ENCRYPTION KEY FROM URL
    // --------------------------------------------------------------------
    // If the URL contains #key=..., we use it for E2E encryption.
    // This allows sharing notes without sending keys to the server.
    if (isBrowser && window.location.hash.startsWith('#key=')) {
      try {
        const base64Key = window.location.hash.slice(5);
        const keyBuffer = base64ToArrayBuffer(base64Key);
        storeRoomKey(noteId, new Uint8Array(keyBuffer));
        console.log('[E2E] Extracted encryption key from URL hash');
        
        // Clear hash from URL for security/cleanliness
        history.replaceState(null, '', window.location.pathname);
      } catch (err) {
        console.error('[E2E] Failed to extract key from URL:', err);
      }
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

  function handleEditorUpdate(content: any) {
    // Local changes started
    networkStatus.setSyncStatus('syncing');
  }

  function handleSyncStatus(status: 'syncing' | 'synced') {
    networkStatus.setSyncStatus(status);
  }

  function handleConnectionStatus(status: { connected: boolean; peerCount: number; signalingConnected?: boolean }) {
    networkStatus.updatePeerState(status.connected, status.peerCount, status.signalingConnected || status.connected);
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
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-[var(--ui-text)] tracking-tight leading-none">{note.title}</h1>
            
            <!-- Sync Indicator -->
            <div class="flex items-center" title={networkStatus.syncStatus === 'syncing' ? 'Syncing...' : 'Saved to device'}>
              {#if networkStatus.syncStatus === 'syncing'}
                <div class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
              {:else}
                <svg class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </div>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-text-muted)]">
            {networkStatus.syncStatus === 'syncing' ? 'Updating...' : 'All changes saved'}
          </span>
        </div>
      {/if}
    </div>

    <!-- Connection Status -->
    <div class="flex items-center gap-4">
      <div 
        class="group relative flex items-center gap-2 px-4 py-2 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-xl text-xs font-bold uppercase tracking-tighter cursor-help transition-all hover:border-primary/30"
      >
        <span 
          class="w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-500
                {networkStatus.peerStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                 networkStatus.peerStatus === 'searching' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}"
        ></span>
        <span class="text-[var(--ui-text)] min-w-[70px]">
          {networkStatus.statusMessage}
        </span>

        <!-- Tooltip -->
        <div class="absolute top-full right-0 mt-2 w-48 p-3 themed-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <h5 class="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[var(--ui-border)] pb-1">Network Info</h5>
          <div class="space-y-1.5">
            <div class="flex justify-between">
              <span class="text-[var(--ui-text-muted)]">Status:</span>
              <span class="text-primary">{networkStatus.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--ui-text-muted)]">Peers:</span>
              <span>{networkStatus.peerCount}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--ui-text-muted)]">Signaling:</span>
              <span class={networkStatus.signalingConnected ? 'text-green-500' : 'text-red-500'}>
                {networkStatus.signalingConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Button variant="primary" size="sm" onclick={() => isShareModalOpen = true}>
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
          onSyncStatusChange={handleSyncStatus}
          onConnectionStatusChange={handleConnectionStatus}
          onEditorReady={handleEditorReady}
        />
      </div>
    {/if}
  </main>

  <!-- Share Modal -->
  {#if note}
    <ShareModal 
      bind:open={isShareModalOpen} 
      baseUrl={isBrowser ? window.location.origin + window.location.pathname : ''}
      noteId={noteId}
      noteTitle={note.title}
    />
  {/if}
</div>

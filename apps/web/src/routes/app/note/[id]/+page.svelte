<!-- =========================================================================
NOTE EDITOR PAGE (+page.svelte for /app/note/[id])
============================================================================
The main note editing page with collaborative editing capabilities.
Features:
- Real-time collaboration via WebRTC
- Rich text editing with TipTap
- Connection status indicator
- Back button to dashboard
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Editor from '$lib/editor/Editor.svelte';
  import Toolbar from '$lib/editor/Toolbar.svelte';
  import Button from '$lib/components/Button.svelte';
  import { getNote } from '$lib/services/notes.svelte';
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
      const loadedNote = await getNote(noteId);
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

  // Handle editor update
  function handleEditorUpdate(content: any) {
    // Content is automatically synced via Yjs
    // We could save metadata here if needed
  }

  // Handle connection status change
  function handleConnectionStatus(status: { connected: boolean; peerCount: number }) {
    connectionStatus = status;
  }

  // Navigate back to dashboard
  function goBack() {
    goto('/app');
  }

  // Handle toolbar commands
  function handleToolbarCommand(command: string) {
    if (editorInstance) {
      switch (command) {
        case 'bold':
          editorInstance.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editorInstance.chain().focus().toggleItalic().run();
          break;
        case 'heading':
          editorInstance.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'bulletList':
          editorInstance.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editorInstance.chain().focus().toggleOrderedList().run();
          break;
        case 'taskList':
          editorInstance.chain().focus().toggleTaskList().run();
          break;
        case 'blockquote':
          editorInstance.chain().focus().toggleBlockquote().run();
          break;
        case 'code':
          editorInstance.chain().focus().toggleCode().run();
          break;
        case 'highlight':
          editorInstance.chain().focus().toggleHighlight().run();
          break;
      }
    }
  }
</script>

<svelte:head>
  <title>{note ? note.title : 'Note'} - Locanote</title>
</svelte:head>

<div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
  <!-- Header -->
  <header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" onclick={goBack}>
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="ml-2">Back</span>
      </Button>
      
      {#if note}
        <div class="flex flex-col">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{note.title}</h1>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Last updated {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
      {/if}
    </div>

    <!-- Connection Status -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
        <span 
          class="w-2 h-2 rounded-full {connectionStatus.peerCount > 0 ? 'bg-green-500' : connectionStatus.connected ? 'bg-yellow-500' : 'bg-red-500'}"
        ></span>
        <span class="text-gray-600 dark:text-gray-300 hidden sm:inline">
          {#if connectionStatus.peerCount > 0}
            {connectionStatus.peerCount} {connectionStatus.peerCount === 1 ? 'collaborator' : 'collaborators'}
          {:else if connectionStatus.connected}
            Online
          {:else}
            Offline
          {/if}
        </span>
      </div>
      
      <Button variant="secondary" size="sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="ml-2 hidden sm:inline">Share</span>
      </Button>
    </div>
  </header>

  <!-- Toolbar -->
  <Toolbar editor={editorInstance} />

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden p-4">
    {#if isLoading}
      <div class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Loading note...</span>
        </div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onclick={goBack}>Go Back</Button>
        </div>
      </div>
    {:else if note && noteId}
      <div class="h-full max-w-4xl mx-auto">
        <Editor
          noteId={noteId}
          user={currentUser}
          onUpdate={handleEditorUpdate}
          onConnectionStatusChange={handleConnectionStatus}
        />
      </div>
    {/if}
  </main>
</div>

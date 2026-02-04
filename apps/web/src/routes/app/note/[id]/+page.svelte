<!-- =========================================================================
NOTE EDITOR PAGE (+page.svelte for /app/note/[id])
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Editor from '$lib/editor/Editor.svelte';
  import IntentToolbar from '$lib/editor/IntentToolbar.svelte';
  import { Button, ShareModal, Modal, Input, ExportModal } from '$components';
  import { getNote, getNoteForCollaboration } from '$lib/services/notes.svelte';
  import { auth, ui, networkStatus } from '$stores';
  import { isBrowser, base64UrlToUint8Array, base64ToArrayBuffer } from '$utils/browser';
  import { storeRoomKey, hasRoomKey, deriveKeyFromPassword } from '$crypto/e2e';
  import { setupKeyboardShortcuts } from '$lib/keyboard/shortcuts';
  import type { Note } from '$db';

  const noteId = $derived(page.params.id);

  let note = $state<Note | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let editorInstance = $state<any>(null);
  let isShareModalOpen = $state(false);
  let isExportModalOpen = $state(false);
  let templateContent = $state<any>(null);

  // Password Protection State
  let showPasswordPrompt = $state(false);
  let passwordAttempt = $state('');
  let passwordError = $state<string | null>(null);
  let currentSalt = $state<string | null>(null);

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

    // 1. Check for key in URL hash (URL-safe base64url format)
    console.log('[DEBUG] Checking for key in URL hash. Current hash:', window.location.hash);
    console.log('[DEBUG] hasRoomKey before extraction:', hasRoomKey(noteId));
    
    if (isBrowser && window.location.hash.startsWith('#key=')) {
      try {
        const base64UrlKey = window.location.hash.slice(5);
        console.log('[DEBUG] Extracted base64UrlKey from URL:', base64UrlKey);
        const keyBytes = base64UrlToUint8Array(base64UrlKey);
        console.log('[DEBUG] Decoded keyBytes length:', keyBytes.length);
        storeRoomKey(noteId, keyBytes);
        console.log('[DEBUG] Stored room key. hasRoomKey after:', hasRoomKey(noteId));
        history.replaceState(null, '', window.location.pathname);
        console.log('[E2E] Decryption key extracted from URL hash');
      } catch (err) {
        console.error('[E2E] Failed to extract key from URL:', err);
      }
    } else {
      console.log('[DEBUG] No key found in URL hash');
    }

    // 2. Check for protection params in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isProtectedFromUrl = urlParams.get('p') === '1';
    const saltFromUrl = urlParams.get('s');
    
    if (isProtectedFromUrl && saltFromUrl) {
      currentSalt = saltFromUrl;
      if (!hasRoomKey(noteId)) {
        showPasswordPrompt = true;
      }
    }
    
    try {
      const loadedNote = await getNoteForCollaboration(noteId);
      if (!loadedNote) {
        error = 'Note not found or you do not have access';
      } else {
        note = loadedNote;
        
        // 3. Check metadata for protection if not already handled by URL
        if (note.isProtected && !hasRoomKey(noteId)) {
          currentSalt = note.passwordSalt || null;
          showPasswordPrompt = true;
        }
        
        // 4. Check for template content in sessionStorage
        if (isBrowser) {
          const templateKey = `template-content-${noteId}`;
          const storedTemplate = sessionStorage.getItem(templateKey);
          if (storedTemplate) {
            try {
              templateContent = JSON.parse(storedTemplate);
              sessionStorage.removeItem(templateKey);
            } catch (err) {
              console.error('[Template] Failed to parse template content:', err);
            }
          }
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load note';
    } finally {
      isLoading = false;
    }
  });

  async function handlePasswordSubmit() {
    if (!currentSalt) return;
    
    try {
      const saltBuffer = base64ToArrayBuffer(currentSalt);
      const { key } = deriveKeyFromPassword(passwordAttempt, new Uint8Array(saltBuffer));
      
      storeRoomKey(noteId, key);
      showPasswordPrompt = false;
      passwordAttempt = '';
      passwordError = null;
      
      // Refresh to initialize editor with the new key
      window.location.reload();
    } catch (err) {
      passwordError = 'Incorrect password or failed to derive key';
    }
  }

  async function refreshNote() {
    if (!noteId) return;
    const loadedNote = await getNote(noteId);
    if (loadedNote) {
      note = loadedNote;
    }
  }

  function handleEditorUpdate(content: any) {
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
    
    // Setup keyboard shortcuts
    if (editor) {
      setupKeyboardShortcuts(editor, {
        onSave: () => {
          console.log('[Shortcut] Saving note...');
          // Yjs auto-saves, but we can show feedback
        },
        onClose: () => {
          if (isShareModalOpen) isShareModalOpen = false;
          else if (isExportModalOpen) isExportModalOpen = false;
        },
        onTemplate: () => {
          // Templates not available from editor yet
        }
      });
    }
  }

  function goBack() {
    if ('startViewTransition' in document) {
      // @ts-ignore
      document.startViewTransition(() => {
        goto('/app');
      });
    } else {
      goto('/app');
    }
  }
</script>

<svelte:head>
  <title>{note ? note.title : 'Note'} - Locanote</title>
</svelte:head>

<div class="flex flex-col h-screen bg-[var(--ui-bg)] transition-colors duration-500">
  <!-- Header -->
  <header class="flex items-center justify-between px-4 sm:px-6 py-4 bg-[var(--ui-surface)] border-b border-[var(--ui-border)] backdrop-blur-[var(--ui-blur)] z-30">
    <div class="flex items-center gap-3 sm:gap-6">
      <Button variant="ghost" size="sm" onclick={goBack} class="hover:bg-primary/10" aria-label="Back to dashboard" title="Back">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Button>
      
      {#if note}
        <div class="flex flex-col max-w-[150px] sm:max-w-xs">
          <div class="flex items-center gap-2">
            <h1 
              class="text-lg sm:text-xl font-bold text-[var(--ui-text)] tracking-tight leading-none truncate"
              style="view-transition-name: note-title-{noteId}"
            >
              {note.title}
            </h1>
            
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
          <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-text-muted)] truncate">
            {networkStatus.syncStatus === 'syncing' ? 'Updating...' : 'All changes saved'}
          </span>
        </div>
      {/if}
    </div>

    <!-- Connection Status -->
    <div class="flex items-center gap-2 sm:gap-4">
      {#if !ui.cleanMode}
        <div 
          class="group relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-tighter cursor-help transition-all hover:border-primary/30"
        >
          <span 
            class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shadow-sm transition-colors duration-500
                  {networkStatus.peerStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                   networkStatus.peerStatus === 'searching' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}"
          ></span>
          <span class="text-[var(--ui-text)] hidden xs:inline min-w-[70px]">
            {networkStatus.statusMessage}
          </span>

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
      {/if}
      
      <Button variant="ghost" size="sm" onclick={() => isExportModalOpen = true} class="hover:bg-primary/10">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span class="ml-2 hidden sm:inline uppercase tracking-widest text-xs font-black">Export</span>
      </Button>

      <Button variant="primary" size="sm" onclick={() => isShareModalOpen = true}>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="ml-2 hidden sm:inline uppercase tracking-widest text-xs font-black">Share</span>
      </Button>
    </div>
  </header>

  <!-- Intent-Driven Toolbar -->
  <div class="bg-transparent px-2 sm:px-4 py-3 z-20 backdrop-blur-[var(--ui-blur)] overflow-x-auto scrollbar-hide flex justify-center">
    <div class="w-full max-w-5xl">
      <IntentToolbar editor={editorInstance} />
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden p-3 sm:p-6 lg:p-10 relative">
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
    {:else if note && noteId && (!note.isProtected || hasRoomKey(noteId))}
      <div class="h-full max-w-5xl mx-auto themed-card shadow-2xl p-1 sm:p-2">
        <Editor
          noteId={noteId}
          user={currentUser}
          initialContent={templateContent}
          onUpdate={handleEditorUpdate}
          onSyncStatusChange={handleSyncStatus}
          onConnectionStatusChange={handleConnectionStatus}
          onEditorReady={handleEditorReady}
        />
      </div>
    {:else if note && note.isProtected}
       <!-- Handled by showPasswordPrompt modal -->
       <div class="flex items-center justify-center h-full">
         <div class="text-center space-y-4">
           <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
             <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
           </div>
           <p class="text-[var(--ui-text-muted)] font-black uppercase tracking-widest text-xs">Awaiting Decryption...</p>
         </div>
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
      isProtected={note.isProtected}
      onUpdate={refreshNote}
    />

    <ExportModal
      bind:open={isExportModalOpen}
      noteTitle={note.title}
      noteContent={editorInstance?.getJSON() || {}}
    />
  {/if}

  <!-- Password Prompt Modal -->
  <Modal
    bind:open={showPasswordPrompt}
    title="Encrypted Note"
    closeOnBackdrop={false}
    closeOnEscape={false}
  >
    <form onsubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }} class="space-y-6">
      <div class="text-center space-y-2">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm text-[var(--ui-text-muted)]">This note is end-to-end encrypted with a password. Please enter it to continue.</p>
      </div>

      <Input 
        type="password" 
        label="Note Password" 
        placeholder="Enter password" 
        bind:value={passwordAttempt}
        error={passwordError}
        autofocus
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handlePasswordSubmit();
          }
        }}
      />

      <div class="flex gap-3">
        <Button variant="ghost" fullWidth onclick={goBack}>Cancel</Button>
        <Button variant="primary" fullWidth type="submit" disabled={!passwordAttempt}>Unlock Note</Button>
      </div>
    </form>
  </Modal>
</div>

<style>
  /* Mobile horizontal scroll for toolbar */
  header, div {
    scrollbar-width: none;
  }
  header::-webkit-scrollbar, div::-webkit-scrollbar {
    display: none;
  }
</style>

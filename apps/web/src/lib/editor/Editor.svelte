<!-- =========================================================================
EDITOR COMPONENT (Editor.svelte)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Collaboration from '@tiptap/extension-collaboration';
  import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
  import Placeholder from '@tiptap/extension-placeholder';
  import Highlight from '@tiptap/extension-highlight';
  import TaskList from '@tiptap/extension-task-list';
  import TaskItem from '@tiptap/extension-task-item';
  import Typography from '@tiptap/extension-typography';
  import { openDocument } from '$crdt/doc.svelte';
  import { createWebRTCProvider, destroyWebRTCProvider, getWebRTCStatus, type WebrtcProvider } from '$crdt/providers';
  import Toolbar from './Toolbar.svelte';

  // Props
  let {
    noteId,
    user = { name: 'Anonymous', color: '#6366f1', id: 'anonymous' },
    onUpdate,
    onConnectionStatusChange,
    onSyncStatusChange,
    onEditorReady
  }: {
    noteId: string;
    user?: { name: string; color: string; id: string };
    onUpdate?: (content: any) => void;
    onConnectionStatusChange?: (status: { connected: boolean; peerCount: number; signalingConnected?: boolean }) => void;
    onSyncStatusChange?: (status: 'syncing' | 'synced') => void;
    onEditorReady?: (editor: Editor) => void;
  } = $props();

  // Local state
  let editor: Editor | null = $state(null);
  let element: HTMLElement;
  let docInfo = $state<ReturnType<typeof openDocument> | null>(null);
  let isReady = $state(false);
  let isContentLoaded = $state(false);
  let provider = $state<WebrtcProvider | null>(null);
  let isMobileToolbarOpen = $state(false);
  let connectionStatus = $state({ connected: false, peerCount: 0, signalingConnected: false });

  // Initialize editor on mount
  onMount(() => {
    let isDestroyed = false;
    
    console.log('[DEBUG] Editor onMount starting for noteId:', noteId);
    
    try {
      docInfo = openDocument(noteId);
      console.log('[DEBUG] Document opened for noteId:', noteId);

      try {
        console.log('[DEBUG] Creating WebRTC provider with noteId:', noteId, 'user:', user.name);
        // FIX: No roomPassword needed - provider now uses noteId as password internally
        // All users with same noteId will join same WebRTC room
        provider = createWebRTCProvider(
          noteId,
          docInfo.document,
          user
        );
        console.log('[DEBUG] WebRTC provider created successfully');
      } catch (webrtcError) {
        console.warn('[Editor] WebRTC provider failed:', webrtcError);
        provider = null;
      }

      const updateStatus = () => {
        if (provider) {
          connectionStatus = getWebRTCStatus(provider);
          console.log('[DEBUG] WebRTC Status Update:', {
            connected: connectionStatus.connected,
            peerCount: connectionStatus.peerCount,
            signalingConnected: connectionStatus.signalingConnected,
            noteId: noteId
          });
        }
        
        onConnectionStatusChange?.({
          connected: connectionStatus.connected,
          peerCount: connectionStatus.peerCount,
          signalingConnected: connectionStatus.signalingConnected
        });
      };

      const handleSync = (isSynced: boolean) => {
        onSyncStatusChange?.(isSynced ? 'synced' : 'syncing');
        updateStatus();
      };

      if (provider) {
        console.log('[DEBUG] Attaching WebRTC event listeners');
        
        provider.on('status', (event: { connected: boolean }) => {
          console.log('[DEBUG] WebRTC status event:', event, 'for noteId:', noteId);
          updateStatus();
        });
        
        provider.on('peers', (event: { webrtcPeers: string[]; bcPeers: string[] }) => {
          console.log('[DEBUG] WebRTC peers event:', event, 'for noteId:', noteId);
          updateStatus();
        });
        
        provider.on('synced', (event: { synced: boolean }) => {
          console.log('[DEBUG] WebRTC synced event:', event, 'for noteId:', noteId);
          handleSync(event.synced);
        });
        
        // Additional logging for connection errors
        provider.on('connection-error', (event: any) => {
          console.error('[DEBUG] WebRTC connection error:', event, 'for noteId:', noteId);
        });
      }

      const extensions: any[] = [
        StarterKit.configure({ history: false }),
        Typography,
        Highlight.configure({ multicolor: true }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: 'Start typing your ideas...',
          emptyEditorClass: 'is-empty'
        }),
        Collaboration.configure({
          document: docInfo.document
        })
      ];

      if (provider) {
        extensions.push(
          CollaborationCursor.configure({
            provider: provider,
            user: user
          })
        );
      }

      editor = new Editor({
        element: element,
        extensions: extensions,
        // NO 'content' property - TipTap reads from Yjs document automatically
        editable: true,
        autofocus: true,
        injectCSS: false,
        onUpdate: ({ editor }) => {
          if (onUpdate) onUpdate(editor.getJSON());
        },
        onCreate: () => {
          // Check if document already has content from IndexedDB
          const hasContent = docInfo && docInfo.content && docInfo.content.length > 0;
          if (hasContent) {
            isContentLoaded = true;
          }
          // Don't mark ready until content is confirmed loaded
        },
        onDestroy: () => {
          isDestroyed = true;
        }
      });

      // Listen for IndexedDB sync (when local data is loaded)
      docInfo.provider.on('synced', () => {
        console.log(`[Editor] Document ${noteId} synced from IndexedDB`);
        // Check if document has content after IndexedDB sync
        const yContent = docInfo?.document.getXmlFragment('content');
        const hasContent = yContent && yContent.length > 0;
        
        if (hasContent || isContentLoaded) {
          isContentLoaded = true;
          if (!isReady && !isDestroyed) {
            isReady = true;
            updateStatus();
            if (editor) onEditorReady?.(editor);
          }
        }
      });

      // If no IndexedDB content, wait for WebRTC sync (collaborative loading)
      if (provider) {
        provider.on('synced', (event: { synced: boolean }) => {
          if (event.synced && !isContentLoaded && !isDestroyed) {
            console.log(`[Editor] Document ${noteId} synced via WebRTC`);
            isContentLoaded = true;
            isReady = true;
            updateStatus();
            if (editor) onEditorReady?.(editor);
          }
        });
      }

      // Fallback: If no sync events fire within 2 seconds, assume empty new note
      setTimeout(() => {
        if (!isContentLoaded && !isDestroyed) {
          console.log(`[Editor] Document ${noteId} assuming new/empty note`);
          isContentLoaded = true;
          isReady = true;
          updateStatus();
          if (editor) onEditorReady?.(editor);
        }
      }, 2000);
    } catch (error) {
      console.error('[Editor] Failed to initialize:', error);
      isReady = true;
    }

    return () => {
      isDestroyed = true;
      if (editor) {
        editor.destroy();
        editor = null;
      }
      if (provider) {
        destroyWebRTCProvider(provider);
        provider = null;
      }
      if (docInfo) {
        docInfo.destroy();
        docInfo = null;
      }
    };
  });

  $effect(() => {
    if (editor && user) {
      const collaborationCursor = editor.extensionManager.extensions.find(
        ext => ext.name === 'collaborationCursor'
      );
      if (collaborationCursor) {
        collaborationCursor.options.user = user;
      }
    }
    if (provider && provider.awareness && user) {
      provider.awareness.setLocalState({
        user: { name: user.name, color: user.color, id: user.id }
      });
    }
  });
</script>

<div class="relative w-full h-full bg-[var(--ui-surface)] backdrop-blur-[var(--ui-blur)] rounded-2xl overflow-hidden transition-all duration-500">
  <!-- Loading State - Shows while syncing content -->
  {#if !isContentLoaded}
    <div class="absolute inset-0 flex items-center justify-center z-20 bg-[var(--ui-surface)]/80 backdrop-blur-sm">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-bold text-[var(--ui-text-muted)] uppercase tracking-widest">Syncing...</p>
        <p class="text-xs text-[var(--ui-text-muted)] mt-2">Loading collaborative content</p>
      </div>
    </div>
  {/if}

  <!-- Editor Content Area -->
  <div 
    bind:this={element}
    class="prose prose-lg max-w-none h-full overflow-y-auto p-4 sm:p-8 focus:outline-none
           prose-headings:text-[var(--ui-text)]
           prose-p:text-[var(--ui-text)] opacity-90
           prose-strong:text-[var(--ui-text)]
           prose-code:text-primary prose-pre:bg-[var(--ui-bg)]
           prose-blockquote:border-l-primary prose-blockquote:bg-primary/5
           [&_.is-empty]:before:content-[attr(data-placeholder)] 
           [&_.is-empty]:before:text-[var(--ui-text-muted)]
           [&_.is-empty]:before:float-left 
           [&_.is-empty]:before:pointer-events-none"
    class:opacity-50={!isContentLoaded}
  >
    <!-- TipTap mounts here -->
  </div>

  <!-- Mobile Floating Bubble Toolbar -->
  <div class="lg:hidden fixed bottom-6 right-6 z-50">
    {#if isMobileToolbarOpen}
      <div class="mb-4 p-2 themed-card bg-[var(--ui-surface)] border-primary/30 shadow-2xl animate-in zoom-in-90 slide-in-from-bottom-4 duration-300">
        <div class="max-w-[85vw] overflow-x-auto scrollbar-hide">
          <Toolbar {editor} />
        </div>
      </div>
    {/if}
    
    <button 
      onclick={() => isMobileToolbarOpen = !isMobileToolbarOpen}
      class="w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center 
             hover:scale-110 active:scale-95 transition-all glow-border"
      aria-label="Toggle toolbar"
    >
      {#if isMobileToolbarOpen}
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      {:else}
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  /* Custom scrollbar for editor */
  div :global(::-webkit-scrollbar) { width: 6px; }
  div :global(::-webkit-scrollbar-thumb) {
    background: var(--brand-color);
    border-radius: 10px;
    opacity: 0.3;
  }

  /* Collaboration cursor styles */
  :global(.collaboration-cursor__caret) {
    position: relative;
    width: 2px;
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
  }

  :global(.collaboration-cursor__label) {
    position: absolute;
    top: -1.4em;
    left: -1px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1px 4px;
    border-radius: 3px;
    color: white;
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
</style>

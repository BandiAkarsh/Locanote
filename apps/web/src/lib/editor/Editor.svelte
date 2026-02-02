<!-- =========================================================================
EDITOR COMPONENT (Editor.svelte)
============================================================================
A beautiful, collaborative rich text editor powered by TipTap and Yjs.

FEATURES:
- Real-time collaborative editing (via Yjs)
- Rich text formatting (bold, italic, headings, lists, etc.)
- Beautiful glassmorphism design
- Smooth animations and transitions
- Dark mode support
- Placeholder text when empty
- Collaboration cursors (shows other users)

USAGE:
<Editor 
  noteId="note-123"
  user={{ name: 'John', color: '#6366f1' }}
  onUpdate={(content) => console.log('Updated:', content)}
/>
========================================================================== -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Collaboration from '@tiptap/extension-collaboration';
  import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
  import Placeholder from '@tiptap/extension-placeholder';
  import Highlight from '@tiptap/extension-highlight';
  import TaskList from '@tiptap/extension-task-list';
  import TaskItem from '@tiptap/extension-task-item';
  import Typography from '@tiptap/extension-typography';
  import * as Y from 'yjs';
  import { openDocument } from '$crdt/doc.svelte';
  import { createWebRTCProvider, destroyWebRTCProvider, getWebRTCStatus, type WebrtcProvider } from '$crdt/providers';

  // Props
  let {
    noteId,
    user = { name: 'Anonymous', color: '#6366f1', id: 'anonymous' },
    onUpdate,
    onConnectionStatusChange,
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
  let provider = $state<WebrtcProvider | null>(null);
  let connectionStatus = $state({ connected: false, peerCount: 0, signalingConnected: false });

  // Initialize editor on mount
  onMount(() => {
    let isDestroyed = false;
    
    try {
      // Open the Yjs document for this note
      docInfo = openDocument(noteId);

      // Create WebRTC provider for real-time collaboration
      // Wrap in try-catch in case WebRTC fails (e.g., no signaling server)
      try {
        provider = createWebRTCProvider(
          noteId,
          docInfo.document,
          user
        );
      } catch (webrtcError) {
        console.warn('[Editor] WebRTC provider failed to initialize:', webrtcError);
        // Continue without WebRTC - local editing still works
        provider = null;
      }

      // Listen for connection status changes - only if provider exists
      const updateStatus = () => {
        if (provider) {
          connectionStatus = getWebRTCStatus(provider);
        } else {
          connectionStatus = { connected: false, peerCount: 0, signalingConnected: false };
        }
        
        onConnectionStatusChange?.({
          connected: connectionStatus.connected,
          peerCount: connectionStatus.peerCount,
          signalingConnected: connectionStatus.signalingConnected
        });
      };

      // When we sync with other peers
      const handleSync = (isSynced: boolean) => {
        onSyncStatusChange?.(isSynced ? 'synced' : 'syncing');
        updateStatus();
      };

      // Only attach provider event listeners if provider exists
      if (provider) {
        provider.on('status', updateStatus);
        provider.on('peers', updateStatus);
        provider.on('synced', handleSync);
      }

      // Build extensions array - conditionally include CollaborationCursor only if provider exists
      const extensions: any[] = [
        StarterKit.configure({
          history: false, // Disable history - Yjs handles this
        }),
        Typography,
        Highlight.configure({ multicolor: true }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: 'Start typing your note...',
          emptyEditorClass: 'is-empty'
        }),
        Collaboration.configure({
          document: docInfo.document
        })
      ];

      // Only add collaboration cursor if provider exists
      if (provider) {
        extensions.push(
          CollaborationCursor.configure({
            provider: provider,
            user: user
          })
        );
      }

      // Create TipTap editor
      editor = new Editor({
        element: element,
        extensions: extensions,
        content: '',
        editable: true,
        autofocus: false,
        injectCSS: false,
        onUpdate: ({ editor }) => {
          // Call the onUpdate callback if provided
          if (onUpdate) {
            onUpdate(editor.getJSON());
          }
        },
        onCreate: () => {
          if (!isDestroyed) {
            isReady = true;
            updateStatus();
            // Expose editor instance to parent component
            if (editor) {
              onEditorReady?.(editor);
            }
          }
        },
        onDestroy: () => {
          isDestroyed = true;
        }
      });
    } catch (error) {
      console.error('[Editor] Failed to initialize editor:', error);
      isReady = true; // Show editor even if initialization failed partially
    }

    return () => {
      isDestroyed = true;
      // Cleanup on destroy
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

  // Update user cursor when user prop changes
  $effect(() => {
    if (editor) {
      const collaborationCursor = editor.extensionManager.extensions.find(
        ext => ext.name === 'collaborationCursor'
      );
      if (collaborationCursor) {
        collaborationCursor.options.user = user;
      }
    }
    // Update provider awareness when user changes - only if provider exists
    if (provider && provider.awareness) {
      provider.awareness.setLocalState({
        user: {
          name: user.name,
          color: user.color,
          id: user.id
        }
      });
    }
  });
</script>

<!-- Editor Container -->
<div class="relative w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
  <!-- Connection Status Bar -->
  {#if isReady}
    <div class="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
      <span 
        class="w-2 h-2 rounded-full {connectionStatus.peerCount > 0 ? 'bg-green-500' : connectionStatus.signalingConnected ? 'bg-yellow-500' : 'bg-red-500'}"
        title={connectionStatus.peerCount > 0 ? 'Connected with peers' : connectionStatus.signalingConnected ? 'Connected to server' : 'Disconnected'}
      ></span>
      <span class="text-gray-600 dark:text-gray-300">
        {#if connectionStatus.peerCount > 0}
          {connectionStatus.peerCount} {connectionStatus.peerCount === 1 ? 'collaborator' : 'collaborators'}
        {:else if connectionStatus.signalingConnected}
          Online
        {:else}
          Offline
        {/if}
      </span>
    </div>
  {/if}

  <!-- Loading State -->
  {#if !isReady}
    <div class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span class="text-sm text-gray-500 dark:text-gray-400">Loading editor...</span>
      </div>
    </div>
  {/if}

  <!-- Editor Content Area -->
  <div 
    bind:this={element}
    class="prose prose-lg max-w-none h-full overflow-y-auto p-6 focus:outline-none
           prose-headings:text-gray-900 dark:prose-headings:text-gray-100
           prose-p:text-gray-700 dark:prose-p:text-gray-300
           prose-strong:text-gray-900 dark:prose-strong:text-gray-100
           prose-code:text-pink-600 dark:prose-code:text-pink-400
           prose-blockquote:border-l-indigo-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50
           prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
           dark:prose-blockquote:border-l-indigo-400
           [&_.is-empty]:before:content-[attr(data-placeholder)] 
           [&_.is-empty]:before:text-gray-400 
           [&_.is-empty]:before:float-left 
           [&_.is-empty]:before:pointer-events-none"
  >
    <!-- TipTap mounts here -->
  </div>
</div>

<style>
  /* Custom scrollbar */
  div :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  div :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  div :global(::-webkit-scrollbar-thumb) {
    background: #cbd5e1;
    border-radius: 4px;
  }

  div :global(::-webkit-scrollbar-thumb:hover) {
    background: #94a3b8;
  }

  /* Dark mode scrollbar */
  :global(.dark) div :global(::-webkit-scrollbar-thumb) {
    background: #475569;
  }
  
  :global(.dark) div :global(::-webkit-scrollbar-thumb:hover) {
    background: #64748b;
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
    font-size: 12px;
    font-weight: 600;
    line-height: normal;
    padding: 2px 6px;
    border-radius: 4px 4px 4px 0;
    color: white;
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
  }

  /* Task list styles */
  :global(ul[data-type="taskList"]) {
    list-style: none;
    padding: 0;
  }

  :global(ul[data-type="taskList"] li) {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  :global(ul[data-type="taskList"] li > label) {
    flex: 0 0 auto;
    margin-top: 0.25rem;
    margin-right: 0.5rem;
    user-select: none;
  }

  :global(ul[data-type="taskList"] li > div) {
    flex: 1 1 auto;
  }

  :global(ul[data-type="taskList"] input[type="checkbox"]) {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    accent-color: #6366f1;
  }

  /* Highlight styles */
  :global(mark) {
    background-color: #fde047;
    padding: 0.1em 0.2em;
    border-radius: 0.2em;
  }

  :global(.dark mark) {
    background-color: #854d0e;
    color: #fef08a;
  }
</style>

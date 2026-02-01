<!-- =========================================================================
OFFLINE BANNER COMPONENT (OfflineBanner.svelte)
============================================================================
A banner that appears when the user goes offline.
Shows connection status and sync state.

USAGE:
<OfflineBanner />
============================================================================ -->

<script lang="ts">
  import { networkStatus } from '$stores/network.svelte';
  import { fade, slide } from 'svelte/transition';

  let showDetails = $state(false);
  
  // Don't show banner if we're just in a slow connection
  let shouldShow = $derived(!networkStatus.isOnline);
</script>

{#if shouldShow}
  <div 
    class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 shadow-lg"
    transition:slide={{ duration: 300 }}
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Offline Icon -->
        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        
        <div>
          <p class="font-semibold text-sm">You're offline</p>
          <p class="text-xs opacity-80">Your notes are still available. Changes will sync when you're back online.</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          onclick={() => showDetails = !showDetails}
          class="p-1 hover:bg-yellow-600/20 rounded transition-colors"
          aria-label="Toggle details"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button 
          onclick={() => window.location.reload()}
          class="p-1 hover:bg-yellow-600/20 rounded transition-colors"
          aria-label="Retry connection"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
    
    {#if showDetails}
      <div class="mt-2 pt-2 border-t border-yellow-600/30 text-xs" transition:fade>
        <p>Connection type: {networkStatus.connectionType}</p>
        <p>Last synced: Just now</p>
        <p class="mt-1 opacity-75">All your data is stored locally and will automatically sync when your connection is restored.</p>
      </div>
    {/if}
  </div>
{/if}

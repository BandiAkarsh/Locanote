<!-- =========================================================================
OFFLINE BANNER COMPONENT (OfflineBanner.svelte)
============================================================================ -->

<script lang="ts">
  import { networkStatus } from '$stores/network.svelte';
  import { slide, fade } from 'svelte/transition';
  import { Button } from '$components';

  let showDetails = $state(false);
  let shouldShow = $derived(!networkStatus.isOnline);

  function retryConnection() {
    window.location.reload();
  }
</script>

{#if shouldShow}
  <div 
    class="fixed top-0 left-0 right-0 z-[100] px-4 py-3 shadow-2xl border-b border-amber-500/20
           bg-amber-500/10 backdrop-blur-xl transition-all"
    transition:slide={{ duration: 400 }}
  >
    <div class="max-w-7xl mx-auto flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Animated Signal Icon -->
          <div class="relative w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
             <svg class="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
             </svg>
          </div>
          
          <div>
            <h4 class="font-black uppercase tracking-tighter text-amber-600 dark:text-amber-400 leading-none mb-1">Network Disconnected</h4>
            <p class="text-xs font-medium text-amber-900/60 dark:text-amber-200/60">Your edits are being saved locally. They will sync automatically when you're back online.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onclick={() => showDetails = !showDetails} class="hover:bg-amber-500/10 text-amber-600">
            {showDetails ? 'Hide' : 'Details'}
          </Button>
          <Button variant="primary" size="sm" onclick={retryConnection} class="bg-amber-500 text-white hover:bg-amber-600 border-none">
            Reconnect
          </Button>
        </div>
      </div>

      {#if showDetails}
        <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 grid grid-cols-2 sm:grid-cols-4 gap-4" transition:fade>
          <div>
            <span class="block text-[10px] uppercase font-bold text-amber-600/50">Storage Status</span>
            <span class="text-sm font-bold text-amber-600">Local DB Active</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase font-bold text-amber-600/50">Last Sync</span>
            <span class="text-sm font-bold text-amber-600">
              {networkStatus.lastSynced ? new Date(networkStatus.lastSynced).toLocaleTimeString() : 'Never'}
            </span>
          </div>
          <div>
            <span class="block text-[10px] uppercase font-bold text-amber-600/50">Connection</span>
            <span class="text-sm font-bold text-amber-600">{networkStatus.connectionType}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase font-bold text-amber-600/50">Pending Changes</span>
            <span class="text-sm font-bold text-amber-600">Waiting...</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

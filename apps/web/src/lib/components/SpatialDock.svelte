<!-- =========================================================================
SPATIAL DOCK (SpatialDock.svelte)
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { auth, ui } from '$stores';

  const items = [
    { id: 'dashboard', path: '/app', label: 'Home', icon: 'home' },
    { id: 'settings', path: '/app/settings', label: 'Settings', icon: 'settings' }
  ];

  let activeItem = $derived(page.url.pathname);

  function navigate(path: string) {
    if ('startViewTransition' in document) {
      // @ts-ignore
      document.startViewTransition(() => {
        goto(path);
      });
    } else {
      goto(path);
    }
  }

  const icons: Record<string, string> = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
  };
</script>

<nav class="spatial-dock group">
  {#each items as item}
    <button
      onclick={() => navigate(item.path)}
      class="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300
             {activeItem === item.path ? 'text-primary scale-110' : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-surface)]'}"
      aria-label={item.label}
    >
      {@html icons[item.icon]}
      
      {#if activeItem === item.path}
        <div 
          class="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
          style="view-transition-name: dock-indicator"
        ></div>
      {/if}
    </button>
  {/each}
  
  <div class="w-px h-6 bg-[var(--ui-border)] mx-1"></div>
  
  <!-- User Profile / Logout Mini -->
  <button
    onclick={() => auth.logout()}
    class="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300"
    title="Logout"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></button>
</nav>

<style>
  .spatial-dock {
    /* Safe Area support */
    margin-bottom: env(safe-area-inset-bottom);
  }
</style>

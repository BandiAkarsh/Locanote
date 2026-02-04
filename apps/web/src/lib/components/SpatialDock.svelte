<!-- =========================================================================
SPATIAL DOCK (SpatialDock.svelte)
============================================================================ -->

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { auth, theme, ui } from '$stores';
  import { fly } from 'svelte/transition';

  const items = [
    { id: 'dashboard', path: '/app', label: 'Home', icon: 'home' },
    { id: 'settings', path: '/app/settings', label: 'Settings', icon: 'settings' }
  ];

  let activeItem = $derived(page.url.pathname);

  function navigate(path: string) {
    if (path === activeItem) return;
    
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
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
  };
</script>

<div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-sm" in:fly={{ y: 20, duration: 800 }}>
  <nav class="premium-dock p-1.5 flex items-center justify-between gap-1 shadow-2xl overflow-hidden border border-[var(--ui-border)] backdrop-blur-3xl">
    <!-- Left: Navigation -->
    <div class="flex items-center gap-1">
      {#each items as item}
        <button
          onclick={() => navigate(item.path)}
          class="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300
                 {activeItem === item.path ? 'bg-primary text-white scale-105 shadow-lg' : 'text-[var(--ui-text-muted)] hover:text-primary hover:bg-primary/10'}"
          aria-label={item.label}
        >
          {@html icons[item.icon]}
        </button>
      {/each}
    </div>

    <div class="w-px h-6 bg-[var(--ui-border)] opacity-30"></div>

    <!-- Right: Tools & Profile -->
    <div class="flex items-center gap-1">
      <!-- Theme Toggle (Material Switch) -->
      <button
        onclick={(e) => theme.toggle(e)}
        class="flex items-center justify-center w-11 h-11 rounded-xl text-[var(--ui-text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-300"
        title={theme.isDark ? 'Switch to Frosted Opal' : 'Switch to Obsidian Glass'}
      >
        {#if theme.isDark}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        {/if}
      </button>

      <!-- Logout -->
      <button
        onclick={() => auth.logout()}
        class="flex items-center justify-center w-11 h-11 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300"
        title="Logout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </nav>
</div>

<style>
  .premium-dock {
    border-radius: 1.25rem;
    background: var(--ui-surface-elevated);
    margin-bottom: env(safe-area-inset-bottom);
  }
</style>

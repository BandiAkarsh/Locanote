<!-- =========================================================================
AUTH GUARD (+layout.svelte for /app/*)
============================================================================
This layout protects all routes under /app/* - only authenticated users can access them.
Unauthenticated users are redirected to the login page.

PLACEMENT: apps/web/src/routes/app/+layout.svelte
========================================================================== -->

<script lang="ts">
  import { auth } from '$stores/auth.svelte';
  import { theme } from '$stores/theme.svelte';
  import { goto } from '$app/navigation';
  import { OfflineBanner, SpatialDock } from '$components';
  import type { Snippet } from 'svelte';

  // Props
  let { children }: { children: Snippet } = $props();

  // Initialize auth on mount
  $effect(() => {
    auth.initialize();
  });

  // Watch auth state and redirect if not authenticated
  $effect(() => {
    if (auth.state.status === 'unauthenticated') {
      goto('/');
    }
  });
</script>

<OfflineBanner />

{#if auth.isAuthenticated}
  <!-- Authenticated content -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span class="text-white font-bold text-sm">L</span>
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">Locanote</span>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            {#if auth.session}
              <span class="text-sm text-gray-600 dark:text-gray-400">{auth.session.username}</span>
            {/if}
            
            <!-- Theme Toggle -->
            <button
              onclick={(e) => theme.toggle(e)}
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {#if theme.isDark}
                <!-- Sun icon for dark mode -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              {:else}
                <!-- Moon icon for light mode -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              {/if}
            </button>
            
            <button
              onclick={() => auth.logout()}
              class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {@render children()}
    </main>

    <!-- Futuristic Dock -->
    <SpatialDock />
  </div>
{:else}
  <!-- Show loading or nothing while checking auth -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="animate-pulse text-gray-400">Loading...</div>
  </div>
{/if}

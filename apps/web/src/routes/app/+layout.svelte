<!-- =========================================================================
AUTH GUARD (+layout.svelte for /app/*)
============================================================================
This layout protects all routes under /app/* - only authenticated users can access them.
Unauthenticated users are redirected to the login page.

PLACEMENT: apps/web/src/routes/app/+layout.svelte
========================================================================== -->

<script lang="ts">
  import { auth } from "$stores/auth.svelte";
  import { theme } from "$stores/theme.svelte";
  import { goto } from "$app/navigation";
  import { OfflineBanner, SpatialDock } from "$components";
  import type { Snippet } from "svelte";

  // Props
  let { children }: { children: Snippet } = $props();

  // Initialize auth on mount
  $effect(() => {
    auth.initialize();
  });

  // Watch auth state and redirect if not authenticated
  $effect(() => {
    if (auth.state.status === "unauthenticated") {
      goto("/");
    }
  });
</script>

<OfflineBanner />

{#if auth.isAuthenticated}
  <!-- Authenticated content -->
  <div class="min-h-screen relative flex flex-col overflow-hidden">
    <!-- Main Content - Full Bleed -->
    <main class="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-32">
      {@render children()}
    </main>

    <!-- Futuristic Dock -->
    <SpatialDock />
  </div>
{:else}
  <!-- Show loading or nothing while checking auth -->
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <div class="animate-pulse text-gray-400">Loading...</div>
  </div>
{/if}

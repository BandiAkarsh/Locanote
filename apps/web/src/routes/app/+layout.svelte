<!-- =========================================================================
NOTEPAD APP LAYOUT
 ============================================================================ -->

<script lang="ts">
  import { auth } from "$stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let initialized = $state(false);

  // Track auth status explicitly for reactivity
  let authStatus = $state(auth.state.status);

  onMount(() => {
    // Initialize auth once on mount
    auth.initialize();
    initialized = true;
    // Update status after init
    authStatus = auth.state.status;
  });

  // Redirect to landing if not authenticated
  $effect(() => {
    // Track auth status changes
    const status = auth.state.status;
    authStatus = status;

    if (initialized && status === "unauthenticated") {
      goto("/", { replaceState: true });
    }
  });
</script>

{#if auth.isAuthenticated}
  {@render children()}
{:else}
  <div class="h-screen flex items-center justify-center bg-[var(--ui-surface)]">
    <div class="text-[var(--ui-text-muted)]">Loading...</div>
  </div>
{/if}

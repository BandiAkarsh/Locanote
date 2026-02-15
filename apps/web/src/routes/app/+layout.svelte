<!-- =========================================================================
NOTEPAD APP LAYOUT
============================================================================ -->

<script lang="ts">
  import { auth } from "$stores/auth.svelte";
  import { goto } from "$app/navigation";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    auth.initialize();
  });

  $effect(() => {
    if (auth.state.status === "unauthenticated") {
      goto("/");
    }
  });
</script>

{#if auth.isAuthenticated}
  {@render children()}
{:else}
  <div
    class="h-screen flex items-center justify-center bg-[var(--np-bg-secondary)]"
  >
    <div class="text-[var(--np-text-muted)]">Loading...</div>
  </div>
{/if}

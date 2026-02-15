<!-- =========================================================================
NOTEPAD ROOT LAYOUT
============================================================================ -->

<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { isBrowser } from "$utils/browser";
  import { dev } from "$app/environment";
  import "../app.css";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    if (isBrowser && "serviceWorker" in navigator && !dev) {
      navigator.serviceWorker.register("/service-worker.js", {
        type: "module",
      });
    }
  });
</script>

{@render children()}

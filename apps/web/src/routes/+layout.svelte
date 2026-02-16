<!-- =========================================================================
NOTEPAD ROOT LAYOUT
============================================================================ -->

<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { isBrowser } from "$utils/browser";
  import { dev } from "$app/environment";
  import { theme } from "$stores";
  import "../app.css";

  let { children }: { children: Snippet } = $props();

  // Apply dark class to document based on theme
  $effect(() => {
    if (isBrowser) {
      if (theme.isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  });

  onMount(() => {
    if (isBrowser && "serviceWorker" in navigator && !dev) {
      navigator.serviceWorker.register("/service-worker.js", {
        type: "module",
      });
    }
  });
</script>

{@render children()}

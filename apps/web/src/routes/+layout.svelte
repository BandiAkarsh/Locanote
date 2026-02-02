<!-- =========================================================================
ROOT LAYOUT COMPONENT (+layout.svelte)
============================================================================ -->

<script lang="ts">
	// ========================================================================
	// IMPORTS
	// ========================================================================
	import type { Snippet } from 'svelte';                        // Type for renderable content
	import { theme } from '$stores/theme.svelte';                 // Theme store
	import { isBrowser } from '$utils/browser';                   // Browser check
	import '../app.css';                                          // Global CSS (Tailwind + custom styles)

	// ========================================================================
	// PROPS (Data received from SvelteKit)
	// ========================================================================
	let { children }: { children: Snippet } = $props();           // Destructure the children prop

	// ========================================================================
	// THEME & ACCENT SYNC
	// ========================================================================
	// Keep the DOM in sync with the theme store
	$effect(() => {
		if (!isBrowser) return;
		
		const html = document.documentElement;
		
		// Sync Dark/Light Mode
		if (theme.isDark) {
			html.classList.add('dark');
			html.setAttribute('data-theme', 'dark');
		} else {
			html.classList.remove('dark');
			html.setAttribute('data-theme', 'light');
		}

		// Sync Accent Color
		html.setAttribute('data-accent', theme.accent);
	});
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
	{@render children()}
</div>

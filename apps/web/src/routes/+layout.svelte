<!-- =========================================================================
ROOT LAYOUT COMPONENT (+layout.svelte)
============================================================================ -->

<script lang="ts">
	// ========================================================================
	// IMPORTS
	// ========================================================================
	import { onMount, type Snippet } from 'svelte';               // Type for renderable content
	import { theme } from '$stores/theme.svelte';                 // Theme store
	import { isBrowser } from '$utils/browser';                   // Browser check
  import { BackgroundProvider, OfflineBanner } from '$components';
  import { dev } from '$app/environment';
	import '../app.css';                                          // Global CSS (Tailwind + custom styles)

	// ========================================================================
	// PROPS (Data received from SvelteKit)
	// ========================================================================
	let { children }: { children: Snippet } = $props();           // Destructure the children prop

	// ========================================================================
	// SERVICE WORKER REGISTRATION
	// ========================================================================
	onMount(() => {
		if (isBrowser && 'serviceWorker' in navigator && !dev) {
			navigator.serviceWorker.register('/service-worker.js', {
				type: 'module'
			}).then(reg => {
				console.log('[SW] Registered successfully');
			}).catch(err => {
				console.error('[SW] Registration failed:', err);
			});
		}
	});

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

		// Sync Accent Color & Visual Theme
		html.setAttribute('data-accent', theme.accent);
    html.setAttribute('data-visual-theme', theme.style);
	});
</script>

<!-- Global Background Layer -->
<BackgroundProvider />

<!-- Global Connectivity Alert -->
<OfflineBanner />

<div class="min-h-screen transition-colors duration-300 relative z-0">
	{@render children()}
</div>

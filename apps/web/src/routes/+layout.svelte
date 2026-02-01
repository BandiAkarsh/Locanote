<!-- =========================================================================
ROOT LAYOUT COMPONENT (+layout.svelte)
============================================================================
This component wraps EVERY page in your application.
It's like the walls and ceiling that surround every room in a building.

WHAT GOES HERE:
- Navigation bars
- Footers
- Global styles
- Things that should appear on every page

HOW IT WORKS:
- {@render children()} is where page content appears
- This layout applies to all routes (/, /app, /app/note/123, etc.)
- Nested layouts can override or extend this one

SVELTE 5 CONCEPTS USED:
- $props() - The new way to receive data from parent components
- {@render} - The new way to render child content (replaces <slot/>)
========================================================================== -->

<script lang="ts">
	// ========================================================================
	// IMPORTS
	// ========================================================================
	import type { Snippet } from 'svelte';                        // Type for renderable content
	import '../app.css';                                          // Global CSS (Tailwind + custom styles)

	// ========================================================================
	// PROPS (Data received from SvelteKit)
	// ========================================================================
	// In Svelte 5, we use $props() instead of "export let"
	// "children" is a special prop - it's the page content to render
	let { children }: { children: Snippet } = $props();           // Destructure the children prop
</script>

<!-- ==========================================================================
MAIN LAYOUT STRUCTURE
==========================================================================
We keep this simple for now. The actual layout (sidebar, header, etc.)
will be added in the /app route's layout.

min-h-screen: Minimum height of full viewport (prevents footer at middle)
bg-gray-50: Light gray background
dark:bg-gray-900: Dark mode background color
=========================================================================== -->
<div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
	<!-- ====================================================================
	RENDER PAGE CONTENT
	====================================================================
	{@render children()} is Svelte 5's way of saying "put the page here"
	This replaces the old <slot /> syntax from Svelte 4
	==================================================================== -->
	{@render children()}
</div>

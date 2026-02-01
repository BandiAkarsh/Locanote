<!-- =========================================================================
SPINNER COMPONENT (Spinner.svelte)
============================================================================
A simple loading spinner animation.

USAGE EXAMPLES:
<Spinner />
<Spinner size="lg" />
<Spinner class="text-white" />
========================================================================== -->

<script lang="ts">
	// ========================================================================
	// TYPE DEFINITIONS
	// ========================================================================
	type Props = {
		size?: 'sm' | 'md' | 'lg';                                  // Spinner size
		class?: string;                                             // Custom CSS classes
	};

	// ========================================================================
	// PROPS (with defaults)
	// ========================================================================
	let {
		size = 'md',                                                // Default to medium size
		class: className = ''                                       // Custom classes
	}: Props = $props();

	// ========================================================================
	// SIZE CLASSES
	// ========================================================================
	const sizeClasses = {
		sm: 'h-4 w-4',                                              // Small: 16px
		md: 'h-6 w-6',                                              // Medium: 24px
		lg: 'h-8 w-8'                                               // Large: 32px
	};
</script>

<!-- ==========================================================================
SPINNER SVG
==========================================================================
An animated spinning circle. Uses Tailwind's animate-spin utility.

The SVG has two parts:
1. A faded circle (the track)
2. A partial arc (the spinning part)
=========================================================================== -->
<svg
	class="animate-spin {sizeClasses[size]} {className}"
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	aria-hidden="true"
	role="status"
>
	<!-- The track (faded circle) -->
	<circle
		class="opacity-25"
		cx="12"
		cy="12"
		r="10"
		stroke="currentColor"
		stroke-width="4"
	/>
	<!-- The spinning arc -->
	<path
		class="opacity-75"
		fill="currentColor"
		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
	/>
</svg>

<!-- Screen reader text -->
<span class="sr-only">Loading...</span>

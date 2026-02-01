<!-- =========================================================================
BUTTON COMPONENT (Button.svelte)
============================================================================
A reusable button component with multiple variants and states.

WHY A BUTTON COMPONENT?
- Consistent styling across the app
- Handles loading states, disabled states
- Accessible by default (keyboard navigation, focus styles)

SVELTE 5 CONCEPTS:
- $props() - Receives properties from parent
- type Props - TypeScript interface for type safety
- ...restProps - Passes through any additional HTML attributes

USAGE EXAMPLES:
<Button>Click me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" loading={true}>Deleting...</Button>
<Button disabled>Can't click</Button>
========================================================================== -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        // Type for child content
	import type { HTMLButtonAttributes } from 'svelte/elements';  // HTML button types

	// ========================================================================
	// TYPE DEFINITIONS
	// ========================================================================
	// We define what props this component accepts.
	// "extends HTMLButtonAttributes" means it accepts all normal button props too.
	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';     // Button style variant
		size?: 'sm' | 'md' | 'lg';                                  // Button size
		loading?: boolean;                                          // Show loading spinner
		fullWidth?: boolean;                                        // Stretch to full width
		children: Snippet;                                          // Content inside button
	};

	// ========================================================================
	// PROPS (with defaults)
	// ========================================================================
	// We destructure props and set default values for optional ones.
	let {
		variant = 'primary',                                        // Default to primary style
		size = 'md',                                                // Default to medium size
		loading = false,                                            // Default not loading
		fullWidth = false,                                          // Default not full width
		disabled = false,                                           // Default not disabled
		type = 'button',                                            // Default type (not submit)
		children,                                                   // Required: button content
		class: className = '',                                      // Custom CSS classes
		...restProps                                                // Any other button attributes
	}: Props = $props();

	// ========================================================================
	// COMPUTED VALUES
	// ========================================================================
	// We compute the CSS classes based on the props.
	// This is more readable than putting it all in the class attribute.

	// Base classes that apply to ALL buttons
	const baseClasses = `                                          
		inline-flex items-center justify-center gap-2               
		font-medium rounded-lg                                      
		transition-colors duration-150                              
		focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed             
	`;                                                              // Remove extra whitespace below

	// Variant-specific classes (colors)
	const variantClasses = {
		primary: `
			bg-indigo-600 text-white                                  
			hover:bg-indigo-700                                       
			focus-visible:ring-indigo-500                             
		`,
		secondary: `
			bg-white text-gray-700 border border-gray-300             
			hover:bg-gray-50                                          
			focus-visible:ring-indigo-500                             
			dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600  
			dark:hover:bg-gray-700                                    
		`,
		danger: `
			bg-red-600 text-white                                     
			hover:bg-red-700                                          
			focus-visible:ring-red-500                                
		`,
		ghost: `
			bg-transparent text-gray-700                              
			hover:bg-gray-100                                         
			focus-visible:ring-indigo-500                             
			dark:text-gray-200 dark:hover:bg-gray-800                 
		`
	};

	// Size-specific classes (padding and text size)
	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',                                  // Small: compact padding
		md: 'px-4 py-2 text-base',                                  // Medium: standard padding
		lg: 'px-6 py-3 text-lg'                                     // Large: generous padding
	};
</script>

<!-- ==========================================================================
BUTTON ELEMENT
==========================================================================
We combine all our classes and props into a single button element.

ACCESSIBILITY:
- type="button" prevents accidental form submission
- disabled attribute handles both disabled prop and loading state
- aria-busy tells screen readers the button is loading
=========================================================================== -->
<button
	type={type}
	disabled={disabled || loading}
	aria-busy={loading}
	class="
		{baseClasses}
		{variantClasses[variant]}
		{sizeClasses[size]}
		{fullWidth ? 'w-full' : ''}
		{className}
	"
	{...restProps}
>
	<!-- ====================================================================
	LOADING SPINNER
	====================================================================
	Shows a spinning animation when loading is true.
	The spinner is an SVG that rotates infinitely.
	==================================================================== -->
	{#if loading}
		<svg
			class="h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			/>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	{/if}

	<!-- ====================================================================
	BUTTON CONTENT
	====================================================================
	Render whatever content was passed to the button.
	{@render children()} is Svelte 5's way to render child content.
	==================================================================== -->
	{@render children()}
</button>

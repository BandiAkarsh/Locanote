<!-- =========================================================================
INPUT COMPONENT (Input.svelte)
============================================================================
A reusable text input component with label, error states, and icons.

WHY AN INPUT COMPONENT?
- Consistent styling and behavior
- Built-in label and error message handling
- Accessible by default (proper label associations)

SVELTE 5 CONCEPTS:
- $bindable() - Creates two-way binding like bind:value
- Snippets - For custom icons or addons

USAGE EXAMPLES:
<Input label="Email" bind:value={email} type="email" />
<Input label="Password" bind:value={password} type="password" error="Too short" />
<Input label="Search" bind:value={query} placeholder="Search notes..." />
========================================================================== -->

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';   // HTML input types

	// ========================================================================
	// TYPE DEFINITIONS
	// ========================================================================
	type Props = Omit<HTMLInputAttributes, 'value'> & {
		label?: string;                                             // Label text above input
		error?: string;                                             // Error message below input
		hint?: string;                                              // Helper text below input
		value?: string;                                             // Input value (bindable)
	};

	// ========================================================================
	// PROPS (with defaults)
	// ========================================================================
	let {
		label,                                                      // Optional label
		error,                                                      // Optional error message
		hint,                                                       // Optional hint text
		value = $bindable(''),                                      // Two-way bindable value
		type = 'text',                                              // Input type (text, email, password, etc.)
		disabled = false,                                           // Disabled state
		class: className = '',                                      // Custom CSS classes
		id,                                                         // Input ID (for label association)
		...restProps                                                // Any other input attributes
	}: Props = $props();

	// ========================================================================
	// GENERATE UNIQUE ID
	// ========================================================================
	// If no ID is provided, generate one for label association.
	// This ensures the label's "for" attribute matches the input's "id".
	// Use $derived to make it reactive when id prop changes.
	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<!-- ==========================================================================
INPUT CONTAINER
==========================================================================
Wraps the label, input, and messages in a flex column.
=========================================================================== -->
<div class="flex flex-col gap-1.5 {className}">
	<!-- ====================================================================
	LABEL
	====================================================================
	Only rendered if label prop is provided.
	The "for" attribute associates the label with the input.
	Clicking the label focuses the input (accessibility).
	==================================================================== -->
	{#if label}
		<label
			for={inputId}
			class="text-sm font-medium text-gray-700 dark:text-gray-300"
		>
			{label}
		</label>
	{/if}

	<!-- ====================================================================
	INPUT ELEMENT
	====================================================================
	The actual text input. Uses bind:value for two-way binding.

	CLASSES BREAKDOWN:
	- w-full: Full width of container
	- rounded-lg: Rounded corners
	- border: Gray border
	- px-3 py-2: Padding inside
	- focus:ring-2: Blue ring on focus
	- error state: Red border when error exists
	==================================================================== -->
	<input
		{type}
		id={inputId}
		bind:value
		{disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		class="
			w-full rounded-lg border px-3 py-2
			text-gray-900 placeholder-gray-400
			transition-colors duration-150
			focus:outline-none focus:ring-2 focus:ring-offset-0
			disabled:bg-gray-100 disabled:cursor-not-allowed
			dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
			{error
				? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
				: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-gray-600'
			}
		"
		{...restProps}
	/>

	<!-- ====================================================================
	ERROR MESSAGE
	====================================================================
	Only rendered if error prop is provided.
	Red text below the input to indicate what's wrong.
	==================================================================== -->
	{#if error}
		<p
			id="{inputId}-error"
			class="text-sm text-red-600 dark:text-red-400"
			role="alert"
		>
			{error}
		</p>
	{:else if hint}
		<!-- ================================================================
		HINT TEXT
		================================================================
		Helper text shown when there's no error.
		Gray text below the input to provide guidance.
		================================================================ -->
		<p
			id="{inputId}-hint"
			class="text-sm text-gray-500 dark:text-gray-400"
		>
			{hint}
		</p>
	{/if}
</div>

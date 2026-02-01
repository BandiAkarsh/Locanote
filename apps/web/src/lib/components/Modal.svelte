<!-- =========================================================================
MODAL COMPONENT (Modal.svelte)
============================================================================
A reusable modal/dialog component for popups.

WHY A MODAL COMPONENT?
- Consistent popup behavior across the app
- Handles backdrop clicks, escape key, focus trapping
- Accessible: proper ARIA roles, focus management

SVELTE 5 CONCEPTS:
- $bindable() for open state
- $effect() for side effects (like body scroll lock)
- Snippets for title and content

USAGE EXAMPLES:
<Modal bind:open={showModal} title="Confirm Delete">
  <p>Are you sure you want to delete this note?</p>
  <Button onclick={() => open = false}>Cancel</Button>
</Modal>
========================================================================== -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        // Type for child content

	// ========================================================================
	// TYPE DEFINITIONS
	// ========================================================================
	type Props = {
		open?: boolean;                                             // Whether modal is visible
		title?: string;                                             // Modal title
		description?: string;                                       // Screen reader description
		closeOnBackdrop?: boolean;                                  // Close when clicking backdrop
		closeOnEscape?: boolean;                                    // Close when pressing Escape
		children: Snippet;                                          // Modal content
	};

	// ========================================================================
	// PROPS (with defaults)
	// ========================================================================
	let {
		open = $bindable(false),                                    // Two-way bindable open state
		title,                                                      // Optional title
		description,                                                // Optional description
		closeOnBackdrop = true,                                     // Default: close on backdrop click
		closeOnEscape = true,                                       // Default: close on Escape key
		children                                                    // Required: modal content
	}: Props = $props();

	// ========================================================================
	// REFS
	// ========================================================================
	let dialogRef: HTMLDialogElement;                              // Reference to the dialog element

	// ========================================================================
	// EFFECTS
	// ========================================================================
	// $effect runs whenever its dependencies change.
	// Here, we sync the open prop with the dialog's open state.

	$effect(() => {
		if (!dialogRef) return;                                    // Guard: wait for element to exist

		if (open && !dialogRef.open) {
			dialogRef.showModal();                                   // Open the dialog natively
		} else if (!open && dialogRef.open) {
			dialogRef.close();                                       // Close the dialog natively
		}
	});

	// ========================================================================
	// EVENT HANDLERS
	// ========================================================================

	// Handle backdrop click (clicking outside the modal content)
	function handleBackdropClick(event: MouseEvent) {
		if (!closeOnBackdrop) return;                              // Check if enabled

		const rect = dialogRef.getBoundingClientRect();            // Get modal dimensions
		const isOutside =                                          // Check if click was outside
			event.clientX < rect.left ||                             // Left of modal
			event.clientX > rect.right ||                            // Right of modal
			event.clientY < rect.top ||                              // Above modal
			event.clientY > rect.bottom;                             // Below modal

		if (isOutside) {
			open = false;                                            // Close the modal
		}
	}

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();                                  // Prevent default close
			open = false;                                            // Close via our state
		}
	}

	// Handle native close event (when dialog closes for any reason)
	function handleClose() {
		open = false;                                              // Sync our state
	}
</script>

<!-- ==========================================================================
DIALOG ELEMENT
==========================================================================
We use the native <dialog> element for built-in accessibility.

BENEFITS OF NATIVE DIALOG:
- Automatic focus trapping (can't tab outside)
- Proper ARIA roles built-in
- Inert background (can't interact with page behind)
- showModal() method for proper modal behavior

BACKDROP STYLING:
The ::backdrop pseudo-element styles the dark overlay behind the modal.
=========================================================================== -->
<dialog
	bind:this={dialogRef}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	onclose={handleClose}
	aria-labelledby={title ? 'modal-title' : undefined}
	aria-describedby={description ? 'modal-description' : undefined}
	class="
		m-0 p-0 max-w-md w-full max-h-[90vh]
		bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm
		open:animate-in open:fade-in open:zoom-in-95
	"
>
	<!-- ====================================================================
	MODAL CONTENT WRAPPER
	====================================================================
	The actual visible modal box with white background.
	We stop click propagation so clicks inside don't close the modal.
	==================================================================== -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={(e) => e.stopPropagation()}
		class="
			bg-white dark:bg-gray-800
			rounded-xl shadow-xl
			p-6
			flex flex-col gap-4
		"
	>
		<!-- ================================================================
		MODAL HEADER
		================================================================
		Contains title and close button.
		Only rendered if title is provided.
		================================================================ -->
		{#if title}
			<div class="flex items-center justify-between">
				<h2
					id="modal-title"
					class="text-lg font-semibold text-gray-900 dark:text-gray-100"
				>
					{title}
				</h2>

				<!-- Close button (X) -->
				<button
					type="button"
					onclick={() => open = false}
					class="
						p-1 rounded-lg
						text-gray-400 hover:text-gray-600
						hover:bg-gray-100 dark:hover:bg-gray-700
						focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
					"
					aria-label="Close modal"
				>
					<!-- X icon (SVG) -->
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		<!-- ================================================================
		DESCRIPTION (for screen readers)
		================================================================
		Hidden visually but available to screen readers.
		================================================================ -->
		{#if description}
			<p id="modal-description" class="sr-only">
				{description}
			</p>
		{/if}

		<!-- ================================================================
		MODAL BODY
		================================================================
		Render the content passed to the modal.
		================================================================ -->
		<div class="text-gray-600 dark:text-gray-300">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	/* ========================================================================
	MODAL ANIMATION
	========================================================================
	We use CSS keyframes for the open animation.
	The "open:" prefix only applies these when the dialog is open.
	======================================================================== */
	@keyframes fade-in {
		from { opacity: 0; }                                       /* Start invisible */
		to { opacity: 1; }                                         /* End visible */
	}

	@keyframes zoom-in {
		from { transform: scale(0.95); }                           /* Start slightly smaller */
		to { transform: scale(1); }                                /* End at full size */
	}

	dialog[open] {
		animation:                                                 /* Apply both animations */
			fade-in 150ms ease-out,                                  /* Fade in over 150ms */
			zoom-in 150ms ease-out;                                  /* Zoom in over 150ms */
	}

	dialog[open]::backdrop {
		animation: fade-in 150ms ease-out;                         /* Backdrop also fades in */
	}
</style>

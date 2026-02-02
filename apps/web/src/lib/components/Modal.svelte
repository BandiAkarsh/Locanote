<!-- =========================================================================
MODAL COMPONENT (Modal.svelte)
============================================================================ -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        

	type Props = {
		open?: boolean;                                             
		title?: string;                                             
		description?: string;                                       
		closeOnBackdrop?: boolean;                                  
		closeOnEscape?: boolean;                                    
		children: Snippet;                                          
	};

	let {
		open = $bindable(false),                                    
		title,                                                      
		description,                                                
		closeOnBackdrop = true,                                     
		closeOnEscape = true,                                       
		children                                                    
	}: Props = $props();

	let dialogRef: HTMLDialogElement;                              

	$effect(() => {
		if (!dialogRef) return;                                    

		if (open && !dialogRef.open) {
			dialogRef.showModal();                                   
		} else if (!open && dialogRef.open) {
			dialogRef.close();                                       
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (!closeOnBackdrop) return;                              

		const rect = dialogRef.getBoundingClientRect();            
		const isOutside =                                          
			event.clientX < rect.left ||                             
			event.clientX > rect.right ||                            
			event.clientY < rect.top ||                              
			event.clientY > rect.bottom;                             

		if (isOutside) {
			open = false;                                            
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();                                  
			open = false;                                            
		}
	}

	function handleClose() {
		open = false;                                              
	}
</script>

<dialog
	bind:this={dialogRef}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	onclose={handleClose}
	aria-labelledby={title ? 'modal-title' : undefined}
	aria-describedby={description ? 'modal-description' : undefined}
	class="
		m-0 p-4 max-w-md w-full max-h-[90vh] mx-auto my-auto
		bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-[var(--ui-blur)]
		open:animate-in open:fade-in open:zoom-in-95
	"
>
	<div
		onclick={(e) => e.stopPropagation()}
		class="
			themed-card
			p-6
			flex flex-col gap-4
		"
	>
		{#if title}
			<div class="flex items-center justify-between">
				<h2
					id="modal-title"
					class="text-xl font-bold text-[var(--ui-text)]"
				>
					{title}
				</h2>

				<button
					type="button"
					onclick={() => open = false}
					class="
						p-2 rounded-[var(--ui-radius)]
						text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]
						hover:bg-[var(--ui-surface)]
						focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
					"
					aria-label="Close modal"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		{#if description}
			<p id="modal-description" class="sr-only">
				{description}
			</p>
		{/if}

		<div class="text-[var(--ui-text)]">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes zoom-in {
		from { transform: scale(0.95); }
		to { transform: scale(1); }
	}

	dialog[open] {
		animation:
			fade-in 200ms ease-out,
			zoom-in 200ms ease-out;
	}

	dialog[open]::backdrop {
		animation: fade-in 200ms ease-out;
	}
</style>

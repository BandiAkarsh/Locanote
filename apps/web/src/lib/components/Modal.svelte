<!-- =========================================================================
MODAL COMPONENT (Modal.svelte)
============================================================================ -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        

	type Size = 'default' | 'large' | 'xl';

	type Props = {
		open?: boolean;                                             
		title?: string;                                             
		description?: string;                                       
		closeOnBackdrop?: boolean;                                  
		closeOnEscape?: boolean;                                    
		size?: Size;
		onEnter?: () => void;
		type?: 'modal' | 'sheet'; // 'modal' centers, 'sheet' slides up on mobile
		children: Snippet;                                          
	};

	let {
		open = $bindable(false),                                    
		title,                                                      
		description,                                                
		closeOnBackdrop = true,                                     
		closeOnEscape = true,                                       
		size = 'default',
		onEnter,
		type = 'modal',
		children                                                   
	}: Props = $props();

	const sizeClasses: Record<Size, string> = {
		default: 'max-w-md',
		large: 'max-w-2xl lg:max-w-4xl',
		xl: 'max-w-3xl lg:max-w-5xl'
	};

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

	// Focus management: when modal opens, focus the first interactive element
	$effect(() => {
		if (open && dialogRef) {
			const focusable = dialogRef.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (focusable.length > 0) {
				(focusable[0] as HTMLElement).focus();
			}
		}
	});

	function handleClose() {
		open = false;                                              
	}
</script>

<svelte:window onkeydown={(e) => {
	if (open) {
		if (e.key === 'Escape' && closeOnEscape) {
			open = false;
		}
		if (e.key === 'Enter' && onEnter && !e.shiftKey) {
			const target = e.target as HTMLElement;
			// Don't trigger if in textarea or contenteditable (unless it's an input)
			if (target && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
				e.preventDefault();
				onEnter();
			}
		}
	}
}} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
	bind:this={dialogRef}
	onclick={handleBackdropClick}
	onclose={handleClose}
	data-type={type}
	tabindex="-1"
	aria-labelledby={title ? 'modal-title' : undefined}
	aria-describedby={description ? 'modal-description' : undefined}
	class="
		m-0 p-4 {sizeClasses[size]} w-full max-h-[90vh] mx-auto my-auto
		bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-[var(--ui-blur)]
		open:animate-in open:fade-in open:zoom-in-95
    {type === 'sheet' ? 'sm:my-auto mb-0 rounded-t-[2.5rem] sm:rounded-[2.5rem] sheet-animation' : ''}
	"
>
	<div
		role="document"
		class="
			glass-2
			p-6
			flex flex-col gap-4
      {type === 'sheet' ? 'rounded-t-[2.5rem] sm:rounded-[2.5rem]' : 'rounded-[2.5rem]'}
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

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

	dialog[open] {
		animation:
			fade-in 200ms ease-out,
			zoom-in 200ms ease-out;
	}

  @media (max-width: 640px) {
    dialog[data-type="sheet"][open] {
      animation: slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

	dialog[open]::backdrop {
		animation: fade-in 200ms ease-out;
	}
</style>

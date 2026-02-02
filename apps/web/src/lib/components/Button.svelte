<!-- =========================================================================
BUTTON COMPONENT (Button.svelte)
============================================================================ -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        
	import type { HTMLButtonAttributes } from 'svelte/elements';  

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';     
		size?: 'sm' | 'md' | 'lg';                                  
		loading?: boolean;                                          
		fullWidth?: boolean;                                        
		children: Snippet;                                          
	};

	let {
		variant = 'primary',                                        
		size = 'md',                                                
		loading = false,                                            
		fullWidth = false,                                          
		disabled = false,                                           
		type = 'button',                                            
		children,                                                   
		class: className = '',                                      
		...restProps                                                
	}: Props = $props();

	// Base classes
	const baseClasses = `                                          
		inline-flex items-center justify-center gap-2               
		font-bold rounded-[var(--ui-radius)]                        
		transition-all duration-300                              
		focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed             
	`;

	// Variant-specific classes using theme variables
	const variantClasses = {
		primary: `
			btn-primary
			bg-primary text-white                                  
			hover:brightness-110 shadow-lg glow-border
			focus-visible:ring-primary                             
		`,
		secondary: `
			btn-secondary
			bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)]             
			hover:bg-[var(--ui-border)] shadow-sm
			focus-visible:ring-primary                             
		`,
		danger: `
			btn-danger
			bg-red-600 text-white                                     
			hover:bg-red-700                                          
			focus-visible:ring-red-500                                
		`,
		ghost: `
			btn-ghost
			bg-transparent text-[var(--ui-text)]                              
			hover:bg-[var(--ui-surface)]                                         
			focus-visible:ring-primary                             
		`
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',                                  
		md: 'px-5 py-2.5 text-base',                                  
		lg: 'px-8 py-4 text-lg'                                     
	};
</script>

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
	{#if loading}
		<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
		</svg>
	{/if}
	{@render children()}
</button>

<!-- =========================================================================
BUTTON COMPONENT (Button.svelte)
============================================================================ -->

<script lang="ts">
	import type { Snippet } from 'svelte';                        
	import type { HTMLButtonAttributes } from 'svelte/elements';  

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';     
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

	// Base classes with Spring Physics
	const baseClasses = `                                          
		inline-flex items-center justify-center gap-2               
		font-black uppercase tracking-widest rounded-xl
		transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
		focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
		disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale
    active:scale-95
	`;

	// Variant-specific classes
	const variantClasses = {
		primary: `
			bg-primary text-white shadow-xl shadow-primary/20
			hover:scale-105 hover:shadow-primary/40
		`,
		secondary: `
			bg-[var(--ui-surface-elevated)] text-[var(--ui-text)] border border-[var(--ui-border)]
			hover:scale-105 hover:bg-[var(--ui-surface)]
		`,
		glass: `
			glass-2 bg-white/10 text-[var(--ui-text)]
      hover:scale-105
		`,
		danger: `
			bg-red-500 text-white shadow-xl shadow-red-500/20
			hover:scale-105 hover:bg-red-600
		`,
		ghost: `
			bg-transparent text-[var(--ui-text-muted)]
			hover:text-[var(--ui-text)] hover:bg-primary/5
		`
	};

	const sizeClasses = {
		sm: 'px-4 py-2 text-[10px]',                                  
		md: 'px-6 py-3.5 text-xs',                                  
		lg: 'px-10 py-5 text-sm'                                     
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

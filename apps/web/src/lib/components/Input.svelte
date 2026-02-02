<!-- =========================================================================
INPUT COMPONENT (Input.svelte)
============================================================================ -->

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';   

	type Props = Omit<HTMLInputAttributes, 'value'> & {
		label?: string;                                             
		error?: string;                                             
		hint?: string;                                              
		value?: string;                                             
	};

	let {
		label,                                                      
		error,                                                      
		hint,                                                       
		value = $bindable(''),                                      
		type = 'text',                                              
		disabled = false,                                           
		class: className = '',                                      
		id,                                                         
		...restProps                                                
	}: Props = $props();

	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label
			for={inputId}
			class="text-sm font-bold text-[var(--ui-text)] ml-1"
		>
			{label}
		</label>
	{/if}

	<input
		{type}
		id={inputId}
		bind:value
		{disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		class="
			w-full rounded-[var(--ui-radius)] border px-4 py-3
			text-[var(--ui-text)] placeholder-[var(--ui-text-muted)]
			bg-[var(--ui-surface)] border-[var(--ui-border)]
      backdrop-blur-[var(--ui-blur)]
			transition-all duration-300
			focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
			disabled:opacity-50 disabled:cursor-not-allowed
			{error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
		"
		{...restProps}
	/>

	{#if error}
		<p id="{inputId}-error" class="text-xs font-medium text-red-500 ml-1" role="alert">
			{error}
		</p>
	{:else if hint}
		<p id="{inputId}-hint" class="text-xs text-[var(--ui-text-muted)] ml-1">
			{hint}
		</p>
	{/if}
</div>

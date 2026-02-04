<!-- =========================================================================
INPUT COMPONENT (Input.svelte)
============================================================================ -->

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';   
  import type { Snippet } from 'svelte';

	type Props = Omit<HTMLInputAttributes, 'value' | 'size'> & {
		label?: string;                                             
		error?: string;                                             
		hint?: string;                                              
		value?: string;                                             
    icon?: Snippet; // Svelte 5 Snippet for icons
		size?: 'default' | 'sm';
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
    icon,
		size = 'default',
		...restProps                                                
	}: Props = $props();

	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
  let inputElement: HTMLInputElement;

  export function focus() {
    inputElement?.focus();
  }
</script>

<div class="flex flex-col gap-2 {className}">
	{#if label}
		<label
			for={inputId}
			class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4"
		>
			{label}
		</label>
	{/if}

  <div class="relative group">
    {#if icon}
      <div class="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity">
        {@render icon()}
      </div>
    {/if}

    <input
      bind:this={inputElement}
      {type}
      id={inputId}
      bind:value
      {disabled}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
      class="
        w-full rounded-2xl
        text-[var(--ui-text)] placeholder-white/20
        bg-white/5 border border-white/10
        backdrop-blur-xl
        transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
        focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
        disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale
        {error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''}
        {icon ? 'pl-16 pr-6' : 'px-6'}
        {size === 'sm' ? 'py-2 text-sm' : 'py-4'}
      "
      {...restProps}
    />
  </div>

	{#if error}
		<p id="{inputId}-error" class="text-[10px] font-black uppercase tracking-widest text-red-500 ml-4 animate-in fade-in slide-in-from-top-1" role="alert">
			{error}
		</p>
	{:else if hint}
		<p id="{inputId}-hint" class="text-[10px] font-bold text-[var(--ui-text-muted)] ml-4 opacity-60">
			{hint}
		</p>
	{/if}
</div>

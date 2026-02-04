<!-- =========================================================================
ROOT LAYOUT COMPONENT (+layout.svelte)
============================================================================ -->

<script lang="ts">
	// ========================================================================
	// IMPORTS
	// ========================================================================
	import { onMount, type Snippet } from 'svelte';               
	import { theme } from '$stores/theme.svelte';                 
	import { isBrowser } from '$utils/browser';                   
  import { BackgroundProvider, OfflineBanner } from '$components';
  import { dev } from '$app/environment';
	import '../app.css';                                          

	// ========================================================================
	// PROPS
	// ========================================================================
	let { children }: { children: Snippet } = $props();           

	// ========================================================================
	// GLOBAL MOUSE TRACKER (Zero UI Spatial Bridge)
	// ========================================================================
	let mouseX = $state(50);
	let mouseY = $state(50);

	function handleMouseMove(e: MouseEvent) {
		mouseX = (e.clientX / window.innerWidth) * 100;
		mouseY = (e.clientY / window.innerHeight) * 100;
		
		// Set CSS variables for Aura/Crystalline reactivity
		document.documentElement.style.setProperty('--mouse-x', `${mouseX}%`);
		document.documentElement.style.setProperty('--mouse-y', `${mouseY}%`);
	}

	// ========================================================================
	// SERVICE WORKER & BATTERY SCOUT
	// ========================================================================
	onMount(() => {
		if (isBrowser && 'serviceWorker' in navigator && !dev) {
			navigator.serviceWorker.register('/service-worker.js', {
				type: 'module'
			});
		}

		// Zero UI: Battery-Saver Auto-Switch
		if (isBrowser && 'getBattery' in navigator) {
			(navigator as any).getBattery().then((battery: any) => {
				const checkBattery = () => {
					if (battery.charging === false && battery.level < 0.2) {
						console.log('[ZeroUI] Low battery detected. Switching to Obsidian Glass.');
						theme.setDark();
					}
				};
				battery.addEventListener('levelchange', checkBattery);
				checkBattery();
			});
		}
	});

	// ========================================================================
	// THEME & ACCENT SYNC
	// ========================================================================
	$effect(() => {
		if (!isBrowser) return;
		const html = document.documentElement;
		if (theme.isDark) {
			html.classList.add('dark');
			html.setAttribute('data-theme', 'dark');
		} else {
			html.classList.remove('dark');
			html.setAttribute('data-theme', 'light');
		}
		html.setAttribute('data-accent', theme.accent);
	});
</script>

<svelte:window onmousemove={handleMouseMove} />

<!-- 1. PHYSICAL OPTICS ENGINE (SVG Refraction Filter) -->
<svg class="sr-only" width="0" height="0">
	<filter id="refraction" x="-20%" y="-20%" width="140%" height="140%">
		<feTurbulence 
			type="fractalNoise" 
			baseFrequency="0.015" 
			numOctaves="3" 
			result="noise" 
		/>
		<feDisplacementMap 
			in="SourceGraphic" 
			in2="noise" 
			scale="15" 
			xChannelSelector="R" 
			yChannelSelector="G" 
		/>
	</filter>
</svg>

<!-- 2. IMMERSIVE BACKGROUND LAYER -->
<BackgroundProvider />

<!-- 3. GLOBAL ALERTS -->
<OfflineBanner />

<div class="min-h-screen relative z-0 selection:bg-primary/30">
	{@render children()}
</div>

<style>
	/* Global View Transitions Polish */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: 0.5s;
	}
</style>

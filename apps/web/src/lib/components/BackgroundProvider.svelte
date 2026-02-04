<!-- =========================================================================
BACKGROUND PROVIDER (BackgroundProvider.svelte)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ui } from '$stores';
  import { performanceScout } from '$lib/utils/performance.svelte';

  let canvas = $state<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number;
  let time = 0;

  // Reactive background selection based on UI state and performance
  let currentStyle = $derived(
    performanceScout.tier === 'low' ? 'aura' : ui.backgroundStyle
  );

  onMount(() => {
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  });

  // Re-initialize if style changes
  $effect(() => {
    if (currentStyle === 'nebula' && canvas) {
      if (!ctx) initNebula();
    } else {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        ctx = null;
      }
    }
  });

  function initNebula() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    animate();
  }

  function resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function animate() {
    if (!ctx || !canvas || currentStyle !== 'nebula') return;
    
    time += 0.005;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Smooth moving blobs
    drawBlob(
      centerX + Math.cos(time * 0.7) * (canvas.width * 0.2),
      centerY + Math.sin(time * 0.5) * (canvas.height * 0.2),
      canvas.width * 0.4,
      'rgba(99, 102, 241, 0.15)'
    );
    
    drawBlob(
      centerX + Math.sin(time * 0.4) * (canvas.width * 0.3),
      centerY + Math.cos(time * 0.6) * (canvas.height * 0.15),
      canvas.width * 0.5,
      'rgba(168, 85, 247, 0.12)'
    );
    
    drawBlob(
      centerX + Math.cos(time * 0.3) * (canvas.width * 0.25),
      centerY + Math.sin(time * 0.8) * (canvas.height * 0.3),
      canvas.width * 0.45,
      'rgba(236, 72, 153, 0.1)'
    );

    animationFrame = requestAnimationFrame(animate);
  }

  function drawBlob(x: number, y: number, radius: number, color: string) {
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
</script>

<svelte:window onresize={resize} />

<div class="fixed inset-0 -z-50 overflow-hidden bg-[var(--ui-bg)] transition-colors duration-1000">
  {#if currentStyle === 'nebula'}
    <canvas bind:this={canvas} class="absolute inset-0 opacity-60 pointer-events-none"></canvas>
  {:else if currentStyle === 'aura'}
    <div class="aura-bg"></div>
  {:else if currentStyle === 'crystalline'}
    <!-- Crystalline Shards Look -->
    <div class="absolute inset-0 opacity-20 transition-all duration-1000" 
         style="background-image: 
           linear-gradient(135deg, var(--brand-color) 25%, transparent 25%), 
           linear-gradient(225deg, var(--brand-color) 25%, transparent 25%), 
           linear-gradient(45deg, var(--brand-color) 25%, transparent 25%), 
           linear-gradient(315deg, var(--brand-color) 25%, transparent 25%);
         background-position: 40px 0, 40px 0, 0 0, 0 0;
         background-size: 80px 80px;
         background-repeat: repeat;
         filter: blur(2px);">
    </div>
  {:else if currentStyle === 'static'}
    <div class="absolute inset-0 opacity-10 bg-gradient-to-br from-primary via-purple-500 to-pink-500"></div>
  {/if}
  
  <!-- Global Intent Overlay -->
  <div class="liquid-mesh"></div>
  
  <div class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg');"></div>
</div>

<style>
  canvas {
    filter: blur(60px);
  }
</style>

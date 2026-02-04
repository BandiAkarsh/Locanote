<!-- =========================================================================
BACKGROUND PROVIDER (BackgroundProvider.svelte)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ui } from '$stores';
  import { performanceScout } from '$lib/utils/performance.svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let animationFrame: number;
  let time = 0;

  // Reactive background selection based on UI state and performance
  let currentStyle = $derived(
    performanceScout.tier === 'low' ? 'aura' : ui.backgroundStyle
  );

  onMount(() => {
    if (currentStyle === 'nebula') {
      initNebula();
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
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
    
    // Draw 3 moving blobs for the Nebula effect
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    drawBlob(
      centerX + Math.cos(time * 0.7) * 200,
      centerY + Math.sin(time * 0.5) * 200,
      400,
      'rgba(99, 102, 241, 0.15)' // Indigo
    );
    
    drawBlob(
      centerX + Math.sin(time * 0.4) * 300,
      centerY + Math.cos(time * 0.6) * 150,
      500,
      'rgba(168, 85, 247, 0.12)' // Purple
    );
    
    drawBlob(
      centerX + Math.cos(time * 0.3) * 250,
      centerY + Math.sin(time * 0.8) * 300,
      450,
      'rgba(236, 72, 153, 0.1)' // Pink
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

<div class="fixed inset-0 -z-50 overflow-hidden bg-[var(--ui-bg)]">
  {#if currentStyle === 'nebula'}
    <canvas bind:this={canvas} class="absolute inset-0 opacity-60"></canvas>
  {:else if currentStyle === 'aura'}
    <div class="aura-bg"></div>
  {:else if currentStyle === 'crystalline'}
    <!-- Simplified Crystalline implementation for now -->
    <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(30deg, var(--brand-color) 12%, transparent 12.5%, transparent 87%, var(--brand-color) 87.5%, var(--brand-color)), linear-gradient(150deg, var(--brand-color) 12%, transparent 12.5%, transparent 87%, var(--brand-color) 87.5%, var(--brand-color)), linear-gradient(30deg, var(--brand-color) 12%, transparent 12.5%, transparent 87%, var(--brand-color) 87.5%, var(--brand-color)), linear-gradient(150deg, var(--brand-color) 12%, transparent 12.5%, transparent 87%, var(--brand-color) 87.5%, var(--brand-color)), linear-gradient(60deg, #a855f7 25%, transparent 25.5%, transparent 75%, #a855f7 75%, #a855f7), linear-gradient(60deg, #a855f7 25%, transparent 25.5%, transparent 75%, #a855f7 75%, #a855f7); background-size: 80px 140px;"></div>
  {/if}
  
  <!-- Subtle Grain Overly for premium feel -->
  <div class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg');"></div>
</div>

<style>
  canvas {
    filter: blur(40px);
  }
</style>

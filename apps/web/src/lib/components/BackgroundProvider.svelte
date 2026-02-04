<!-- =========================================================================
BACKGROUND PROVIDER (BackgroundProvider.svelte)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ui, theme } from '$stores';
  import { performanceScout } from '$lib/utils/performance.svelte';

  let canvas = $state<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number;
  let time = 0;

  // Global Mouse Parallax State
  let mouseX = $state(0.5);
  let mouseY = $state(0.5);

  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }

  // Reactive background selection
  let currentStyle = $derived(
    performanceScout.tier === 'low' ? 'aura' : ui.backgroundStyle
  );

  onMount(() => {
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  });

  $effect(() => {
    if (currentStyle === 'nebula' && canvas) {
      if (!ctx) initNebula();
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      ctx = null;
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
    
    time += 0.002;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Physical Liquid Mesh Simulation
    const accent = theme.isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)';
    const secondary = theme.isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)';
    
    // React to mouse
    const offsetX = (mouseX - 0.5) * 100;
    const offsetY = (mouseY - 0.5) * 100;

    drawBlob(
      centerX + Math.cos(time) * 300 + offsetX,
      centerY + Math.sin(time * 0.8) * 200 + offsetY,
      canvas.width * 0.6,
      accent
    );
    
    drawBlob(
      centerX + Math.sin(time * 0.7) * 400 - offsetX,
      centerY + Math.cos(time * 1.2) * 250 - offsetY,
      canvas.width * 0.7,
      secondary
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

<svelte:window onresize={resize} onmousemove={handleMouseMove} />

<div class="fixed inset-0 -z-[100] overflow-hidden bg-[var(--ui-bg)] transition-colors duration-1000">
  <!-- 1. NEBULA (Liquid Mesh) -->
  {#if currentStyle === 'nebula'}
    <canvas 
      bind:this={canvas} 
      class="absolute inset-0 nebula-render pointer-events-none transition-opacity duration-1000"
    ></canvas>
  
  <!-- 2. AURA (Beautiful Low-Power clouds) -->
  {:else if currentStyle === 'aura'}
    <div class="aura-container absolute inset-0">
      <div class="aura-blob aura-1"></div>
      <div class="aura-blob aura-2"></div>
    </div>
  
  <!-- 3. CRYSTALLINE (3D Shards) -->
  {:else if currentStyle === 'crystalline'}
    <div class="crystalline-container absolute inset-0">
      {#each Array(12) as _, i}
        <div 
          class="shard"
          style="
            left: {Math.random() * 100}%; 
            top: {Math.random() * 100}%; 
            width: {100 + Math.random() * 200}px;
            height: {200 + Math.random() * 300}px;
            --delay: {i * 0.5}s;
            --rotate: {Math.random() * 360}deg;
            --speed: {10 + Math.random() * 20}s;
          "
        ></div>
      {/each}
    </div>
  
  <!-- 4. STATIC -->
  {:else}
    <div class="absolute inset-0 opacity-10 bg-gradient-to-tr from-primary/40 to-transparent"></div>
  {/if}

  <!-- Physical Grain Mask -->
  <div class="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-repeat" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg');"></div>
</div>

<style>
  .nebula-render {
    filter: url(#refraction) blur(80px) saturate(1.5);
  }

  /* AURA ANIMATIONS */
  .aura-container { filter: blur(120px); opacity: 0.5; }
  .aura-blob {
    position: absolute;
    border-radius: 50%;
    background: var(--accent-liquid);
    opacity: 0.6;
    animation: aura-float 20s infinite alternate ease-in-out;
  }
  .aura-1 { width: 60vw; height: 60vw; left: -10%; top: -10%; }
  .aura-2 { width: 50vw; height: 50vw; right: -5%; bottom: -5%; background: #a855f7; animation-delay: -5s; }
  
  @keyframes aura-float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(10%, 10%) scale(1.2); }
  }

  /* CRYSTALLINE SHARDS */
  .crystalline-container {
    perspective: 1500px;
    background: linear-gradient(to bottom, var(--ui-bg), #0f172a);
  }
  .shard {
    position: absolute;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 80%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    animation: shard-float var(--speed) infinite linear;
    animation-delay: var(--delay);
    transform: rotate(var(--rotate));
  }

  @keyframes shard-float {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    20% { opacity: 0.4; }
    80% { opacity: 0.4; }
    100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
  }
</style>

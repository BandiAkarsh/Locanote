<!-- =========================================================================
BACKGROUND PROVIDER (BackgroundProvider.svelte)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ui, theme } from '$stores';
  import { performanceScout } from '$lib/utils/performance.svelte';

  let canvas = $state<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number = 0;
  let time = 0;

  // Global Mouse Parallax State
  let mouseX = $state(0.5);
  let mouseY = $state(0.5);

  function handleMouseMove(e: MouseEvent) {
    if (typeof window === 'undefined') return;
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
    
    document.documentElement.style.setProperty('--mouse-x-raw', mouseX.toString());
    document.documentElement.style.setProperty('--mouse-y-raw', mouseY.toString());
  }

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
    if (!ctx) return;
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

    // Dynamic Accent Colors (Material-Aware)
    const isDark = theme.isDark;
    
    // Fill background with subtle base color to avoid "white flashes"
    ctx.fillStyle = isDark ? 'rgba(5, 5, 10, 1)' : 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Read the current liquid accent from computed style to ensure it matches Intent Engine
    let accentRGB = '99, 102, 241';
    if (typeof document !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      accentRGB = style.getPropertyValue('--accent-liquid-rgb').trim() || '99, 102, 241';
    }
    
    const accent = `rgba(${accentRGB}, ${isDark ? 0.25 : 0.2})`;
    const secondary = isDark ? 'rgba(168, 85, 247, 0.20)' : 'rgba(168, 85, 247, 0.15)';
    const tertiary = isDark ? 'rgba(236, 72, 153, 0.18)' : 'rgba(236, 72, 153, 0.12)';

    // React to mouse parallax
    const offsetX = (mouseX - 0.5) * 150;
    const offsetY = (mouseY - 0.5) * 150;

    drawBlob(
      centerX + Math.cos(time * 0.7) * (canvas.width * 0.2) + offsetX,
      centerY + Math.sin(time * 0.5) * (canvas.height * 0.2) + offsetY,
      canvas.width * 0.5,
      accent
    );
    
    drawBlob(
      centerX + Math.sin(time * 0.4) * (canvas.width * 0.35) - offsetX,
      centerY + Math.cos(time * 0.6) * (canvas.height * 0.15) - offsetY,
      canvas.width * 0.6,
      secondary
    );
    
    drawBlob(
      centerX + Math.cos(time * 0.3) * (canvas.width * 0.3) + (offsetX * 0.5),
      centerY + Math.sin(time * 0.8) * (canvas.height * 0.4) + (offsetY * 0.5),
      canvas.width * 0.65,
      tertiary
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

<div class="fixed inset-0 -z-100 overflow-hidden bg-[var(--ui-bg)] transition-colors duration-1000">
  <!-- 1. NEBULA (Liquid Mesh) -->
  {#if currentStyle === 'nebula'}
    <canvas 
      bind:this={canvas} 
      class="absolute inset-0 nebula-render pointer-events-none transition-opacity duration-1000"
    ></canvas>
  
  <!-- 2. AURA (Beautiful Low-Power clouds) -->
  {:else if currentStyle === 'aura'}
    <div class="aura-container absolute inset-0">
      <div class="aura-blob aura-1" style="background: var(--accent-liquid);"></div>
      <div class="aura-blob aura-2" style="background: #a855f7;"></div>
    </div>
  
  <!-- 3. CRYSTALLINE (3D Shards) -->
  {:else if currentStyle === 'crystalline'}
    <div class="crystalline-container absolute inset-0" style="perspective: 2000px;">
      {#each Array(18) as _, i}
        <div 
          class="shard"
          style="
            left: {Math.random() * 100}%; 
            top: {Math.random() * 100}%; 
            width: {150 + Math.random() * 250}px;
            height: {250 + Math.random() * 400}px;
            --delay: {i * 0.3}s;
            --rotateZ: {Math.random() * 360}deg;
            --speed: {12 + Math.random() * 18}s;
            --opacity: {0.1 + Math.random() * 0.25};
          "
        ></div>
      {/each}
    </div>
  
  <!-- 4. STATIC / PERFORMANCE -->
  {:else if currentStyle === 'static'}
    <div class="absolute inset-0 opacity-10 bg-gradient-to-br from-primary via-purple-500 to-pink-500"></div>
  {/if}
  
  <!-- Global Intent Overlay -->
  <div class="liquid-mesh"></div>
  
  <!-- Native CSS Grain (100% Offline) -->
  <div class="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-noise"></div>
</div>

<style>
  .nebula-render {
    filter: url(#refraction) blur(60px) saturate(1.4);
  }

  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* AURA ANIMATIONS */
  .aura-container { filter: blur(120px); opacity: 0.5; }
  .aura-blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
    animation: aura-float 25s infinite alternate ease-in-out;
  }
  .aura-1 { width: 70vw; height: 70vw; left: -15%; top: -15%; }
  .aura-2 { width: 60vw; height: 60vw; right: -10%; bottom: -10%; animation-delay: -7s; }
  
  @keyframes aura-float {
    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
    100% { transform: translate(15%, 15%) scale(1.3) rotate(10deg); }
  }

  /* CRYSTALLINE SHARDS (PHYSICAL 3D) */
  .crystalline-container {
    background: linear-gradient(to bottom, var(--ui-bg), rgba(var(--accent-liquid-rgb), 0.08));
  }
  
  .shard {
    position: absolute;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 70%);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.2);
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    animation: shard-float var(--speed) infinite linear;
    animation-delay: var(--delay);
    box-shadow: 0 0 40px rgba(var(--accent-liquid-rgb), 0.15);
    /* 3D Parallax Transform */
    transform: 
        rotateZ(var(--rotateZ)) 
        rotateX(calc(var(--mouse-y-raw, 0.5) * 20deg)) 
        rotateY(calc(var(--mouse-x-raw, 0.5) * 20deg));
    transition: transform 0.2s cubic-bezier(0.2, 0, 0.2, 1);
  }

  @keyframes shard-float {
    0% { transform: translateY(110vh) rotateZ(0deg) rotateX(20deg) scale(0.7); opacity: 0; }
    10% { opacity: var(--opacity); }
    90% { opacity: var(--opacity); }
    100% { transform: translateY(-20vh) rotateZ(360deg) rotateX(-20deg) scale(1.3); opacity: 0; }
  }
</style>

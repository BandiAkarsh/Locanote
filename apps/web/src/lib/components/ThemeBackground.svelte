<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$stores/theme.svelte';
  
  interface Fragment {
    id: number;
    startX: string;
    startY: string;
    endX: string;
    endY: string;
    duration: string;
    delay: string;
    scale: number;
    opacity: number;
    size: string;
    clip: string;
    rotation: string;
  }

  let fragments = $state<Fragment[]>([]);

  onMount(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 12 : 30; // Fewer fragments on mobile for performance
    const newFragments: Fragment[] = [];
    
    for (let i = 0; i < count; i++) {
      newFragments.push({
        id: i,
        startX: `${Math.random() * 120 - 10}%`,
        startY: `${Math.random() * 120 - 10}%`,
        endX: `${Math.random() * 120 - 10}%`,
        endY: `${Math.random() * 120 - 10}%`,
        duration: `${40 + Math.random() * 60}s`, // Very slowmo
        delay: `-${Math.random() * 100}s`, // Random start phase
        scale: 0.3 + Math.random() * 1.2,
        opacity: 0.05 + Math.random() * 0.15,
        size: `${30 + Math.random() * 150}px`,
        clip: getRandomShardPath(),
        rotation: `${Math.random() * 360}deg`
      });
    }
    fragments = newFragments;
  });

  function getRandomShardPath() {
    const paths = [
      'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
      'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
      'polygon(0% 15%, 100% 0%, 85% 100%, 15% 85%)',
      'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      'polygon(10% 25%, 90% 10%, 80% 90%, 20% 80%)',
      'polygon(0 0, 100% 20%, 100% 100%, 20% 100%)'
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }
</script>

<div class="glass-fragments" class:opacity-0={theme.style === 'classic' || theme.style === 'inception'}>
  {#each fragments as f (f.id)}
    <div 
      class="fragment"
      style:--startX={f.startX}
      style:--startY={f.startY}
      style:--endX={f.endX}
      style:--endY={f.endY}
      style:--duration={f.duration}
      style:--delay={f.delay}
      style:--scale={f.scale}
      style:--opacity={f.opacity}
      style:--rotation={f.rotation}
      style:width={f.size}
      style:height={f.size}
      style:clip-path={f.clip}
    ></div>
  {/each}
</div>

<style>
  .glass-fragments {
    transition: opacity 1s ease;
  }
</style>

<!-- =========================================================================
CHEF MODE TOOL (ChefTool.svelte)
============================================================================ -->

<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  
  let showTimer = $state(false);
  let timeLeft = $state(0);
  let timerInterval: any;

  function startTimer(minutes: number) {
    timeLeft = minutes * 60;
    showTimer = true;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft > 0) timeLeft--;
      else clearInterval(timerInterval);
    }, 1000);
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
</script>

<div class="flex items-center gap-2" in:scale={{ duration: 400, start: 0.8 }}>
  <div class="flex items-center gap-1 p-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
    <button 
      onclick={() => startTimer(5)}
      class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-emerald-500 hover:bg-emerald-500/20 rounded transition-all"
    >
      5m Timer
    </button>
    <button 
      onclick={() => alert('Scale feature: Coming soon to help you weigh ingredients!')}
      class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-emerald-500 hover:bg-emerald-500/20 rounded transition-all"
    >
      Scale
    </button>
  </div>

  {#if showTimer}
    <div transition:fade class="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="animate-spin-slow"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {formatTime(timeLeft)}
    </div>
  {/if}
</div>

<style>
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
</style>

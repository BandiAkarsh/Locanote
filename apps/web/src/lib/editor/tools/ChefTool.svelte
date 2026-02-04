<!-- =========================================================================
CHEF MODE TOOL (ChefTool.svelte)
============================================================================ -->

<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import type { Editor } from '@tiptap/core';
  
  let { editor }: { editor: Editor | null } = $props();
  
  let showTimer = $state(false);
  let timeLeft = $state(0);
  let isPaused = $state(false);
  let timerInterval: any;

  function startTimer(minutes: number) {
    timeLeft = minutes * 60;
    showTimer = true;
    isPaused = false;
    runTimer();
  }

  function runTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isPaused) {
        if (timeLeft > 0) {
          timeLeft--;
        } else {
          stopTimer();
          // Zero UI: subtle audio cue could go here
          alert('Chef Mode: Timer Finished!');
        }
      }
    }, 1000);
  }

  function togglePause() {
    isPaused = !isPaused;
  }

  function stopTimer() {
    showTimer = false;
    isPaused = false;
    if (timerInterval) clearInterval(timerInterval);
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
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
      onclick={() => startTimer(10)}
      class="px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-emerald-500 hover:bg-emerald-500/20 rounded transition-all"
    >
      10m
    </button>
  </div>

  {#if showTimer}
    <div transition:fade class="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-2 overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class={isPaused ? "" : "animate-spin-slow"}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span class="tabular-nums">{formatTime(timeLeft)}</span>
      
      <div class="flex items-center gap-1 ml-1 border-l border-white/20 pl-2">
        <button onclick={togglePause} class="hover:scale-110 transition-transform" title={isPaused ? "Resume" : "Pause"}>
          {#if isPaused}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          {/if}
        </button>
        <button onclick={stopTimer} class="hover:scale-110 transition-transform text-white/80 hover:text-white" title="Stop">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
        </button>
      </div>
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

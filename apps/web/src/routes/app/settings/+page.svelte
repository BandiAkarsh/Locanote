<!-- =========================================================================
SETTINGS PAGE (+page.svelte for /app/settings)
============================================================================ -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth, theme, ui, type AccentColor, type VisualStyle } from '$stores';
  import { performanceScout } from '$lib/utils/performance.svelte';
  import { Button, Modal, Toggle } from '$components';
  import { fly, fade } from 'svelte/transition';

  // Local state
  let showDeleteConfirm = $state(false);
  let activeTab = $state<'appearance' | 'account' | 'neural'>('appearance');

  const engines: { id: typeof ui.backgroundStyle; name: string; desc: string; icon: string }[] = [
    { id: 'nebula', name: 'Nebula', desc: 'Reactive fluid mesh gradients', icon: '🌌' },
    { id: 'crystalline', name: 'Crystalline', desc: 'High-refraction geometric shards', icon: '💎' },
    { id: 'aura', name: 'Aura', desc: 'Soft, pulsing color clouds', icon: '✨' },
    { id: 'static', name: 'Static', desc: 'Clean, distraction-free gradients', icon: '🖼️' }
  ];

  function handleLogout() {
    auth.logout();
    goto('/');
  }

  function handleDeleteAccount() {
    showDeleteConfirm = false;
    alert('Account purge initiated...');
  }
</script>

<svelte:head>
  <title>System Settings - Locanote</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-12 p-4 sm:p-12 pb-32">
  <!-- Header -->
  <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6" in:fly={{ y: -20 }}>
    <div>
      <h1 class="text-4xl sm:text-5xl font-black text-[var(--ui-text)] tracking-tighter">System Console</h1>
      <p class="text-[var(--ui-text-muted)] font-medium">Configure your neural link and environment.</p>
    </div>
    <Button variant="glass" onclick={() => goto('/app')}>
      <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Return to Hub
    </Button>
  </header>

  <!-- Navigation Tabs -->
  <div class="glass-2 p-1.5 rounded-2xl flex w-fit" in:fade>
    {#each ['appearance', 'neural', 'account'] as tab}
      <button
        onclick={() => activeTab = tab as any}
        class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
               {activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-white/5'}"
      >
        {tab}
      </button>
    {/each}
  </div>

  <!-- Content Areas -->
  {#if activeTab === 'appearance'}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8" in:fly={{ y: 20 }}>
      <!-- Visual Engine -->
      <section class="space-y-6">
        <h2 class="text-xs font-black uppercase tracking-[0.3em] text-primary ml-2">Atmospheric Engine</h2>
        <div class="grid grid-cols-1 gap-4">
          {#each engines as engine}
            <button
              onclick={() => ui.backgroundStyle = engine.id}
              class="glass-2 p-6 rounded-[2rem] text-left group transition-all
                     {ui.backgroundStyle === engine.id ? 'border-primary shadow-glow ring-4 ring-primary/10' : 'border-transparent'}"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <span class="text-2xl drop-shadow-md">{engine.icon}</span>
                  <div class="font-black text-lg {ui.backgroundStyle === engine.id ? 'text-primary' : 'text-[var(--ui-text)]'}">{engine.name}</div>
                </div>
                {#if ui.backgroundStyle === engine.id}
                  <div class="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                {/if}
              </div>
              <p class="text-sm text-[var(--ui-text-muted)] group-hover:text-[var(--ui-text)] transition-colors">{engine.desc}</p>
            </button>
          {/each}
        </div>
      </section>

      <!-- Preferences -->
      <section class="space-y-8">
        <div class="space-y-6">
          <h2 class="text-xs font-black uppercase tracking-[0.3em] text-primary ml-2">Material State</h2>
          <div class="glass-2 p-8 rounded-[2.5rem] space-y-8">
            <div class="flex items-center justify-between">
              <div>
                 <h3 class="font-bold text-[var(--ui-text)]">Active Material</h3>
                 <p class="text-xs text-[var(--ui-text-muted)]">Switch between Frosted Opal and Obsidian Glass</p>
              </div>
              <div class="flex gap-2">
                <button 
                  onclick={() => theme.setLight()} 
                  class="p-3 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 {theme.current === 'light' ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-white/5 text-[var(--ui-text-muted)]'}"
                  title="Frosted Opal"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span class="sr-only">Frosted Opal</span>
                </button>
                <button 
                  onclick={() => theme.setDark()} 
                  class="p-3 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 {theme.current === 'dark' ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-white/5 text-[var(--ui-text-muted)]'}"
                  title="Obsidian Glass"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  <span class="sr-only">Obsidian Glass</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-[var(--ui-text)]">Zero UI (Contextual)</h3>
                <p class="text-xs text-[var(--ui-text-muted)]">Hide telemetry and enable intent-driven interface morphing</p>
              </div>
              <Toggle bind:checked={ui.cleanMode} />
            </div>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="space-y-6">
           <h2 class="text-xs font-black uppercase tracking-[0.3em] text-primary ml-2">Neural Telemetry</h2>
           <div class="glass-2 p-6 rounded-[2rem] grid grid-cols-2 gap-6">
              <div class="text-center">
                <div class="text-2xl font-black text-[var(--ui-text)]">{performanceScout.fps}</div>
                <div class="text-[9px] uppercase tracking-widest text-[var(--ui-text-muted)] font-bold">Latency FPS</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-black text-primary uppercase">{performanceScout.tier}</div>
                <div class="text-[9px] uppercase tracking-widest text-[var(--ui-text-muted)] font-bold">Material Tier</div>
              </div>
           </div>
        </div>
      </section>
    </div>
  {:else if activeTab === 'neural'}
     <div class="glass-2 p-12 rounded-[3rem] text-center space-y-6" in:fly={{ y: 20 }}>
        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
           <svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h2 class="text-2xl font-black text-[var(--ui-text)]">AI Neural Engine</h2>
        <p class="text-[var(--ui-text-muted)] max-w-md mx-auto">Locanote runs 100% of its intelligence on your device. Your data is never sent to the cloud for processing.</p>
        <div class="flex flex-col gap-4 max-w-sm mx-auto pt-6">
           <div class="flex justify-between items-center p-4 glass-2 rounded-2xl">
              <span class="text-xs font-bold uppercase tracking-widest">Whisper AI</span>
              <span class="text-xs font-black text-green-500">Ready (Local)</span>
           </div>
           <div class="flex justify-between items-center p-4 glass-2 rounded-2xl">
              <span class="text-xs font-bold uppercase tracking-widest">Semantic Scout</span>
              <span class="text-xs font-black text-green-500">Optimized</span>
           </div>
        </div>
     </div>
  {:else}
    <div class="max-w-2xl mx-auto space-y-8" in:fly={{ y: 20 }}>
       <section class="glass-2 p-8 rounded-[2.5rem] space-y-6">
          <h3 class="text-lg font-black text-[var(--ui-text)]">Neural Identity</h3>
          <div class="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-1">
             <div class="text-[10px] font-black uppercase tracking-widest text-[var(--ui-text-muted)]">Handle</div>
             <div class="text-xl font-black text-primary">{auth.session?.username}</div>
          </div>
          <Button variant="danger" fullWidth onclick={handleLogout}>Terminate Session</Button>
       </section>

       <section class="p-8 border-2 border-red-500/20 rounded-[2.5rem] space-y-6">
          <h3 class="text-lg font-black text-red-500">Destruction Zone</h3>
          <p class="text-xs text-[var(--ui-text-muted)] leading-relaxed">Purging your account will remove all neural patterns and delete all encrypted notes from this device and the network. This is permanent.</p>
          <Button variant="secondary" fullWidth onclick={() => showDeleteConfirm = true} class="!text-red-500 !border-red-500/20">Purge Identity</Button>
       </section>
    </div>
  {/if}
</div>

<Modal bind:open={showDeleteConfirm} title="Final Directive" type="sheet">
  <div class="space-y-8 text-center">
    <p class="text-lg font-medium text-[var(--ui-text-muted)]">Confirm the complete removal of your identity and all associated data?</p>
    <div class="flex gap-4"><Button variant="secondary" fullWidth onclick={() => showDeleteConfirm = false}>Abort</Button><Button variant="danger" fullWidth onclick={handleDeleteAccount}>Purge All Data</Button></div>
  </div>
</Modal>

<!-- =========================================================================
SETTINGS PAGE (+page.svelte for /app/settings)
============================================================================ -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$stores/auth.svelte';
  import { theme, type AccentColor, type VisualStyle } from '$stores/theme.svelte';
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';

  // Local state
  let showDeleteConfirm = $state(false);
  let activeTab = $state<'appearance' | 'account'>('appearance');

  const accents: { id: AccentColor; name: string; color: string }[] = [
    { id: 'indigo', name: 'Indigo', color: '#6366f1' },
    { id: 'violet', name: 'Violet', color: '#8b5cf6' },
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'fuchsia', name: 'Fuchsia', color: '#d946ef' }
  ];

  const styles: { id: VisualStyle; name: string; desc: string }[] = [
    { id: 'classic', name: 'Classic', desc: 'Clean and familiar design' },
    { id: 'glass', name: 'Glass Design', desc: 'Frosted translucency & movement' },
    { id: 'cyberpunk', name: 'Radium Cyberpunk', desc: 'Gaming UI with neon glow' },
    { id: 'inception', name: 'Modern Inception', desc: 'Minimalist depth & neumorphism' }
  ];

  // Handle logout
  function handleLogout() {
    auth.logout();
    goto('/');
  }

  // Handle account deletion
  function handleDeleteAccount() {
    showDeleteConfirm = false;
    alert('Account deletion not yet implemented');
  }
</script>

<svelte:head>
  <title>Settings - Locanote</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 pb-20">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold text-[var(--ui-text)]">Settings</h1>
      <p class="text-[var(--ui-text-muted)]">Manage your experience</p>
    </div>
    <Button variant="secondary" onclick={() => goto('/app')}>
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span class="ml-2">Back to Dashboard</span>
    </Button>
  </div>

  <!-- Tabs -->
  <div class="border-b border-[var(--ui-border)]">
    <nav class="-mb-px flex space-x-8">
      <button
        onclick={() => activeTab = 'appearance'}
        class="py-4 px-1 border-b-2 font-bold text-sm transition-all {activeTab === 'appearance' ? 'border-primary text-primary' : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'}"
      >
        Appearance
      </button>
      <button
        onclick={() => activeTab = 'account'}
        class="py-4 px-1 border-b-2 font-bold text-sm transition-all {activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'}"
      >
        Account
      </button>
    </nav>
  </div>

  <!-- Content -->
  {#if activeTab === 'appearance'}
    <div class="space-y-6">
      <!-- Visual Style Selection -->
      <div class="themed-card p-6 space-y-6">
        <div>
          <h3 class="text-xl font-bold text-[var(--ui-text)] mb-1">Visual Style</h3>
          <p class="text-sm text-[var(--ui-text-muted)] mb-4">Choose the core aesthetic of the interface</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each styles as style}
              <button
                onclick={() => theme.style = style.id}
                class="p-5 rounded-xl border-2 transition-all text-left group {theme.style === style.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:border-primary/50'}"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-bold text-lg {theme.style === style.id ? 'text-primary' : 'text-[var(--ui-text)]'}">{style.name}</div>
                  {#if theme.style === style.id}
                    <div class="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                  {/if}
                </div>
                <div class="text-sm text-[var(--ui-text-muted)] group-hover:text-[var(--ui-text)] transition-colors">{style.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Mode Selection -->
        <div class="pt-6 border-t border-[var(--ui-border)]">
          <h3 class="text-lg font-bold text-[var(--ui-text)] mb-3">Color Mode</h3>
          <div class="flex flex-wrap gap-3">
            <Button variant={theme.current === 'light' ? 'primary' : 'secondary'} size="sm" onclick={() => theme.setLight()}>Light</Button>
            <Button variant={theme.current === 'dark' ? 'primary' : 'secondary'} size="sm" onclick={() => theme.setDark()}>Dark</Button>
            <Button variant={theme.current === 'system' ? 'primary' : 'secondary'} size="sm" onclick={() => theme.setSystem()}>System</Button>
          </div>
        </div>

        <!-- Accent Color Selection -->
        <div class="pt-6 border-t border-[var(--ui-border)]">
          <h3 class="text-lg font-bold text-[var(--ui-text)] mb-1">Accent Color</h3>
          <p class="text-sm text-[var(--ui-text-muted)] mb-4">Personalize buttons and highlights</p>
          
          <div class="flex flex-wrap gap-4">
            {#each accents as accent}
              <button
                onclick={() => theme.accent = accent.id}
                class="group relative flex flex-col items-center gap-2"
                title={accent.name}
              >
                <div 
                  class="w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center {theme.accent === accent.id ? 'border-[var(--ui-text)] scale-110' : 'border-transparent hover:scale-105'}"
                  style="background-color: {accent.color}"
                >
                  {#if theme.accent === accent.id}
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider {theme.accent === accent.id ? 'text-primary' : 'text-[var(--ui-text-muted)]'}">{accent.name}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Account Settings -->
    <div class="themed-card p-6 space-y-6">
      <div>
        <h3 class="text-lg font-bold text-[var(--ui-text)] mb-2">Account Information</h3>
        <div class="bg-[var(--ui-bg)] rounded-xl border border-[var(--ui-border)] p-4">
          <div class="text-xs font-bold uppercase tracking-widest text-[var(--ui-text-muted)] mb-1">Username</div>
          <div class="text-lg font-medium text-[var(--ui-text)]">{auth.session?.username || 'Unknown'}</div>
        </div>
      </div>

      <div class="pt-4 border-t border-[var(--ui-border)]">
        <h3 class="text-lg font-bold text-[var(--ui-text)] mb-3">Session</h3>
        <Button variant="secondary" onclick={handleLogout}>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="ml-2">Logout</span>
        </Button>
      </div>

      <div class="pt-4 border-t border-[var(--ui-border)]">
        <h3 class="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
        <p class="text-sm text-[var(--ui-text-muted)] mb-4">These actions are irreversible. Please be certain.</p>
        <Button variant="danger" onclick={() => showDeleteConfirm = true}>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="ml-2">Delete Account</span>
        </Button>
      </div>
    </div>
  {/if}
</div>

<Modal
  bind:open={showDeleteConfirm}
  title="Delete Account?"
>
  <div class="space-y-4">
    <p class="text-[var(--ui-text)] opacity-80">
      Are you sure you want to delete your account? This action cannot be undone and all your notes will be permanently deleted.
    </p>
    <div class="flex gap-3 justify-end">
      <Button variant="ghost" onclick={() => showDeleteConfirm = false}>Cancel</Button>
      <Button variant="danger" onclick={handleDeleteAccount}>Delete Account</Button>
    </div>
  </div>
</Modal>

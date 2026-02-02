<!-- =========================================================================
SETTINGS PAGE (+page.svelte for /app/settings)
============================================================================ -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$stores/auth.svelte';
  import { theme, type AccentColor } from '$stores/theme.svelte';
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

  // Handle logout
  function handleLogout() {
    auth.logout();
    goto('/');
  }

  // Handle account deletion (placeholder)
  function handleDeleteAccount() {
    showDeleteConfirm = false;
    alert('Account deletion not yet implemented');
  }
</script>

<svelte:head>
  <title>Settings - Locanote</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p class="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
    </div>
    <Button variant="secondary" onclick={() => goto('/app')}>
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span class="ml-2">Back to Dashboard</span>
    </Button>
  </div>

  <!-- Tabs -->
  <div class="border-b border-gray-200 dark:border-gray-700">
    <nav class="-mb-px flex space-x-8">
      <button
        onclick={() => activeTab = 'appearance'}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'appearance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
      >
        Appearance
      </button>
      <button
        onclick={() => activeTab = 'account'}
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
      >
        Account
      </button>
    </nav>
  </div>

  <!-- Content -->
  {#if activeTab === 'appearance'}
    <div class="space-y-6">
      <!-- Theme Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Theme</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose your preferred color scheme</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onclick={() => theme.setLight()}
              class="p-4 rounded-xl border-2 transition-all text-left {theme.current === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
            >
              <div class="w-10 h-10 rounded-lg bg-white border border-gray-200 mb-3 flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="font-medium text-gray-900 dark:text-white">Light</div>
            </button>

            <button
              onclick={() => theme.setDark()}
              class="p-4 rounded-xl border-2 transition-all text-left {theme.current === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
            >
              <div class="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 mb-3 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div class="font-medium text-gray-900 dark:text-white">Dark</div>
            </button>

            <button
              onclick={() => theme.setSystem()}
              class="p-4 rounded-xl border-2 transition-all text-left {theme.current === 'system' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
            >
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 mb-3 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="font-medium text-gray-900 dark:text-white">System</div>
            </button>
          </div>
        </div>

        <!-- Accent Color Selection -->
        <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Accent Color</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose a color for buttons and highlights</p>
          
          <div class="flex flex-wrap gap-4">
            {#each accents as accent}
              <button
                onclick={() => theme.accent = accent.id}
                class="group relative flex flex-col items-center gap-2"
                title={accent.name}
              >
                <div 
                  class="w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center {theme.accent === accent.id ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}"
                  style="background-color: {accent.color}"
                >
                  {#if theme.accent === accent.id}
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </div>
                <span class="text-xs font-medium {theme.accent === accent.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}">{accent.name}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Account Settings -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Information</h3>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">Username</div>
          <div class="font-medium text-gray-900 dark:text-white">{auth.session?.username || 'Unknown'}</div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Session</h3>
        <Button variant="secondary" onclick={handleLogout}>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="ml-2">Logout</span>
        </Button>
      </div>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">These actions are irreversible. Please be certain.</p>
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

<!-- Delete Account Confirmation Modal -->
<Modal
  bind:open={showDeleteConfirm}
  title="Delete Account?"
>
  <div class="space-y-4">
    <p class="text-gray-600 dark:text-gray-400">
      Are you sure you want to delete your account? This action cannot be undone and all your notes will be permanently deleted.
    </p>
    <div class="flex gap-3 justify-end">
      <Button variant="ghost" onclick={() => showDeleteConfirm = false}>Cancel</Button>
      <Button variant="danger" onclick={handleDeleteAccount}>Delete Account</Button>
    </div>
  </div>
</Modal>

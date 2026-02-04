<!-- =========================================================================
REGISTRATION CARD (RegisterCard.svelte)
============================================================================ -->

<script lang="ts">
  import { Spinner } from '$components';
  import type { AuthState } from '$auth/types';
  import { fade, fly } from 'svelte/transition';

  // Props
  let {
    authState = $bindable({ status: 'idle' }),
    onRegisterPasskey,
    onRegisterPassword,
    onSwitchToLogin
  }: {
    authState: AuthState;
    onRegisterPasskey: (username: string) => void;
    onRegisterPassword: (username: string, password: string) => void;
    onSwitchToLogin: () => void;
  } = $props();

  // Local state
  let username = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let selectedMethod = $state<'passkey' | 'password' | null>(null);
  let isLoading = $state(false);

  // Password validation
  let passwordErrors = $state<string[]>([]);
  
  function validatePassword() {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    passwordErrors = errors;
    return errors.length === 0;
  }

  $effect(() => {
    if (password) validatePassword();
  });

  async function handleRegister() {
    if (!username) return;
    isLoading = true;
    if (selectedMethod === 'passkey') {
      await onRegisterPasskey(username);
    } else {
      if (!validatePassword() || password !== confirmPassword) {
        isLoading = false;
        return;
      }
      await onRegisterPassword(username, password);
    }
    isLoading = false;
  }
</script>

<div class="relative w-full max-w-md mx-auto" in:fly={{ y: 20, duration: 1000 }}>
  <!-- GLASSMORPHISM 2.0 CARD -->
  <div class="glass-2 p-8 sm:p-12 rounded-[3rem] space-y-10">
    <header class="text-center space-y-4">
      <div class="w-20 h-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-glow">
        <svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h1 class="text-4xl font-black text-[var(--ui-text)] tracking-tighter leading-none">Materialize Identity</h1>
      <p class="text-[var(--ui-text-muted)] font-medium">Create your unique neural link to the Locanote network.</p>
    </header>

    <div class="space-y-8">
      <div class="space-y-2">
        <label for="reg-username" class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Portal Handle</label>
        <input
          id="reg-username"
          type="text"
          bind:value={username}
          placeholder="chose_a_handle"
          class="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--ui-text)] placeholder-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
        />
      </div>

      {#if !selectedMethod}
        <div class="space-y-4" in:fade>
           <span class="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ui-text-muted)] ml-4">Select Security Layer</span>
           <button
            onclick={() => selectedMethod = 'passkey'}
            class="w-full p-6 rounded-2xl glass-2 flex items-center gap-5 hover:bg-white/5 group transition-all"
          >
            <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:border-primary/50 border border-transparent transition-all">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div class="text-left">
              <div class="font-bold text-[var(--ui-text)]">Passkey</div>
              <div class="text-xs text-[var(--ui-text-muted)]">Biometric (FaceID/TouchID)</div>
            </div>
          </button>

          <button
            onclick={() => selectedMethod = 'password'}
            class="w-full p-6 rounded-2xl glass-2 flex items-center gap-5 hover:bg-white/5 group transition-all"
          >
            <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:border-primary/50 border border-transparent transition-all">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <div class="text-left">
              <div class="font-bold text-[var(--ui-text)]">Password</div>
              <div class="text-xs text-[var(--ui-text-muted)]">Traditional credentials</div>
            </div>
          </button>
        </div>
      {:else if selectedMethod === 'password'}
        <div class="space-y-4" in:fly={{ x: 20 }}>
          <div class="space-y-2">
            <label for="reg-password" class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Access Key</label>
            <input id="reg-password" type="password" bind:value={password} class="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--ui-text)] focus:outline-none focus:border-primary transition-all" />
          </div>
          <div class="space-y-2">
            <label for="reg-confirm" class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Verify Key</label>
            <input id="reg-confirm" type="password" bind:value={confirmPassword} class="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--ui-text)] focus:outline-none focus:border-primary transition-all" />
          </div>
          
          <button
            onclick={handleRegister}
            disabled={isLoading || !username || !password || password !== confirmPassword || passwordErrors.length > 0}
            class="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            {#if isLoading}
              <Spinner class="w-5 h-5 mx-auto" />
            {:else}
              Initialize Link
            {/if}
          </button>
          
          <button onclick={() => selectedMethod = null} class="w-full text-center text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)] hover:text-primary transition-colors">← Back</button>
        </div>
      {:else}
        <div in:fade class="space-y-6">
          <p class="text-sm text-[var(--ui-text-muted)] text-center">Ready to link your device biometrics to <b>{username}</b>.</p>
          <button
            onclick={handleRegister}
            disabled={isLoading || !username}
            class="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            Finalize Portal Link
          </button>
          <button onclick={() => selectedMethod = null} class="w-full text-center text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)] hover:text-primary transition-colors">← Back</button>
        </div>
      {/if}
    </div>

    {#if authState.status === 'error'}
      <div class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {authState.error}
      </div>
    {/if}

    <footer class="text-center pt-8 border-t border-white/5">
      <button onclick={onSwitchToLogin} class="text-sm font-bold text-primary hover:underline underline-offset-8 transition-all">Existing Identity? Re-stabilize</button>
    </footer>
  </div>
</div>

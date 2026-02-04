<!-- =========================================================================
AUTHENTICATION CARD (AuthCard.svelte)
============================================================================ -->

<script lang="ts">
  import { Spinner } from '$components';
  import type { AuthState } from '$auth/types';
  import { fade, fly } from 'svelte/transition';

  // Props
  let {
    authState = $bindable({ status: 'idle' }),
    onPasskeyLogin,
    onPasswordLogin,
    onSwitchToRegister
  }: {
    authState: AuthState;
    onPasskeyLogin: () => void;
    onPasswordLogin: (username: string, password: string) => void;
    onSwitchToRegister: () => void;
  } = $props();

  // Local state
  let username = $state('');
  let password = $state('');
  let showPasswordForm = $state(false);
  let isLoading = $state(false);

  async function handlePasskeyLogin() {
    isLoading = true;
    await onPasskeyLogin();
    isLoading = false;
  }

  async function handlePasswordLogin() {
    isLoading = true;
    await onPasswordLogin(username, password);
    isLoading = false;
  }
</script>

<div class="relative w-full max-w-md mx-auto" in:fly={{ y: 20, duration: 1000 }}>
  <!-- GLASSMORPHISM 2.0 CARD -->
  <div class="glass-2 p-8 sm:p-12 rounded-[3rem] space-y-10">
    <header class="text-center space-y-4">
      <!-- 3D Icon Container -->
      <div class="w-20 h-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-glow animate-pulse">
        <svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <h1 class="text-4xl font-black text-[var(--ui-text)] tracking-tighter">Portal Login</h1>
      <p class="text-[var(--ui-text-muted)] font-medium">Synchronize your thoughts across the decentralized web.</p>
    </header>

    <div class="space-y-6">
      <div class="space-y-2">
        <label for="auth-username" class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Neural ID</label>
        <input
          id="auth-username"
          type="text"
          bind:value={username}
          placeholder="username"
          class="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--ui-text)] placeholder-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
          onkeydown={(e) => {
            if (e.key === 'Enter' && username) {
              if (showPasswordForm) handlePasswordLogin();
              else showPasswordForm = true;
            }
          }}
        />
      </div>

      {#if showPasswordForm}
        <div class="space-y-2" in:fly={{ x: 20 }}>
          <label for="auth-password" class="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Access Key</label>
          <input
            id="auth-password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            class="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--ui-text)] placeholder-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
            onkeydown={(e) => e.key === 'Enter' && handlePasswordLogin()}
          />
        </div>
      {/if}

      {#if authState.status === 'error'}
        <div class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {authState.error}
        </div>
      {/if}

      <div class="space-y-4 pt-4">
        {#if !showPasswordForm}
          <button
            onclick={handlePasskeyLogin}
            disabled={isLoading}
            class="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            Connect via Passkey
          </button>
          <button
            onclick={() => showPasswordForm = true}
            class="w-full py-4 rounded-2xl glass-2 text-[var(--ui-text)] font-bold hover:bg-white/5 transition-all"
          >
            Manual Access Key
          </button>
        {:else}
          <button
            onclick={handlePasswordLogin}
            disabled={isLoading || !username || !password}
            class="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {#if isLoading}
              <Spinner class="w-5 h-5 mx-auto" />
            {:else}
              Establish Neural Link
            {/if}
          </button>
          <button
            onclick={() => { showPasswordForm = false; password = ''; }}
            class="w-full text-center text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)] hover:text-primary transition-colors"
          >
            ← Back to options
          </button>
        {/if}
      </div>
    </div>

    <footer class="text-center pt-8 border-t border-white/5">
      <button onclick={onSwitchToRegister} class="text-sm font-bold text-primary hover:underline underline-offset-8 transition-all">New here? Materialize an Identity</button>
    </footer>
  </div>
</div>

<style>
  input:-webkit-autofill {
    -webkit-text-fill-color: var(--ui-text);
    -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset;
    transition: background-color 5000s ease-in-out 0s;
  }
</style>

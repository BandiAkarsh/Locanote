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
  <div class="glass-2 p-8 sm:p-12 rounded-[3.5rem] space-y-12">
    <header class="text-center space-y-5">
      <!-- 3D Icon Portal -->
      <div class="w-24 h-24 mx-auto bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-glow animate-pulse overflow-hidden relative group">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <svg class="w-12 h-12 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <h1 class="text-5xl font-black text-[var(--ui-text)] tracking-tighter leading-none">Portal Login</h1>
      <p class="text-[var(--ui-text-muted)] font-medium text-lg text-balance">Synchronize your thoughts across the liquid web.</p>
    </header>

    <form 
      class="space-y-8" 
      onsubmit={(e) => { 
        e.preventDefault(); 
        if (showPasswordForm) handlePasswordLogin(); 
        else handlePasskeyLogin();
      }}
    >
      <div class="space-y-3">
        <label for="auth-username" class="text-[11px] font-black uppercase tracking-[0.3em] text-primary ml-6">Neural Identity</label>
        <input
          id="auth-username"
          type="text"
          bind:value={username}
          placeholder="username"
          class="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-[var(--ui-text)] placeholder-white/20 focus:outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-xl"
          onkeydown={(e) => {
            if (e.key === 'Enter' && username) {
              if (showPasswordForm) handlePasswordLogin();
              else showPasswordForm = true;
            }
          }}
        />
      </div>

      {#if showPasswordForm}
        <div class="space-y-3" in:fly={{ y: 20, duration: 600 }}>
          <label for="auth-password" class="text-[11px] font-black uppercase tracking-[0.3em] text-primary ml-6">Access Key</label>
          <input
            id="auth-password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-[var(--ui-text)] placeholder-white/20 focus:outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-xl"
          />
        </div>
      {/if}

      {#if authState.status === 'error'}
        <div class="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-4 animate-in fade-in zoom-in-95">
          <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="font-bold uppercase tracking-widest text-xs">{authState.error}</span>
        </div>
      {/if}

      <div class="space-y-5 pt-4">
        {#if !showPasswordForm}
          <button
            type="button"
            onclick={handlePasskeyLogin}
            disabled={isLoading}
            class="w-full py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            Connect Passkey
          </button>
          <button
            type="button"
            onclick={() => showPasswordForm = true}
            class="w-full py-5 rounded-[2rem] glass-2 text-[var(--ui-text)] font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
          >
            Manual Access Key
          </button>
        {:else}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            class="w-full py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {#if isLoading}
              <Spinner class="w-6 h-6 mx-auto" />
            {:else}
              Establish Neural Link
            {/if}
          </button>
          <button
            type="button"
            onclick={() => { showPasswordForm = false; password = ''; }}
            class="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-[var(--ui-text-muted)] hover:text-primary transition-colors"
          >
            ← Change Identity Method
          </button>
        {/if}
      </div>
    </form>

    <footer class="text-center pt-10 border-t border-white/5">
      <button 
        onclick={onSwitchToRegister} 
        id="switch-to-register"
        data-testid="switch-to-register"
        class="text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all hover:scale-110 active:scale-95"
      >
        New here? Materialize an Identity
      </button>
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

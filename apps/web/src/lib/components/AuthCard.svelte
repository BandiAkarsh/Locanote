<!-- =========================================================================
AUTHENTICATION CARD (AuthCard.svelte)
============================================================================ -->

<script lang="ts">
  import { Spinner } from '$components';
  import type { AuthState } from '$auth/types';

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

  // Handle passkey login
  async function handlePasskeyLogin() {
    isLoading = true;
    await onPasskeyLogin();
    isLoading = false;
  }

  // Handle password login
  async function handlePasswordLogin() {
    isLoading = true;
    await onPasswordLogin(username, password);
    isLoading = false;
  }
</script>

<!-- Main Container -->
<div class="relative min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-indigo-500/30">
  <!-- Subtle Background Glow -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full opacity-50"></div>
  </div>

  <!-- Content Container -->
  <div class="relative z-10 w-full max-w-md">
    <!-- Redesigned Linear Card -->
    <div class="group relative rounded-2xl bg-[#111] border border-[#222] shadow-2xl transition-all duration-300 hover:border-[#333]">
      <!-- Top Subtle Glow Line -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <!-- Header Section -->
      <div class="p-8 pb-4 text-center">
        <!-- Minimal Logo Icon -->
        <div class="mx-auto mb-6 w-16 h-16 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors duration-500">
          <svg class="w-8 h-8 text-[#fafafa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-[#fafafa] mb-2 tracking-tight">
          Welcome back
        </h1>
        <p class="text-[#888] text-sm">
          Sign in to your account
        </p>
      </div>

      <!-- Form Section -->
      <div class="px-8 pb-8 space-y-5">
        <!-- Username Input -->
        <div class="space-y-2">
          <label for="auth-username" class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">
            Username
          </label>
          <div class="relative group/input">
            <input
              id="auth-username"
              type="text"
              bind:value={username}
              placeholder="username"
              onkeydown={(e) => {
                if (e.key === 'Enter' && username) {
                  if (showPasswordForm) handlePasswordLogin();
                  else showPasswordForm = true;
                }
                if (e.key === 'Escape' && showPasswordForm) {
                  showPasswordForm = false;
                  password = '';
                }
              }}
              class="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-[#fafafa] placeholder-[#444]
                     focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                     transition-all duration-200"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within/input:text-indigo-500/50 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Password Form -->
        {#if showPasswordForm}
          <div class="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label for="auth-password" class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">
              Password
            </label>
            <div class="relative group/input">
              <input
                id="auth-password"
                type="password"
                bind:value={password}
                placeholder="••••••••"
                onkeydown={(e) => {
                  if (e.key === 'Enter' && username && password) {
                    handlePasswordLogin();
                  }
                  if (e.key === 'Escape') {
                    showPasswordForm = false;
                    password = '';
                  }
                }}
                class="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-[#fafafa] placeholder-[#444]
                       focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                       transition-all duration-200"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within/input:text-indigo-500/50 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        {/if}

        <!-- Error Message -->
        {#if authState.status === 'error'}
          <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {authState.error}
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="space-y-3 pt-2">
          {#if !showPasswordForm}
            <button
              onclick={handlePasskeyLogin}
              disabled={isLoading}
              class="w-full py-3 px-6 rounded-lg bg-[#fafafa] text-[#000] font-bold text-sm
                     hover:bg-white active:scale-[0.98]
                     transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Sign in with Passkey
            </button>

            <button
              onclick={() => showPasswordForm = true}
              disabled={isLoading}
              class="w-full py-3 px-6 rounded-lg bg-transparent text-[#fafafa] font-semibold text-sm border border-[#222]
                     hover:bg-[#161616] hover:border-[#333]
                     transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Use password instead
            </button>
          {:else}
            <button
              onclick={handlePasswordLogin}
              disabled={isLoading || !username || !password}
              class="w-full py-3 px-6 rounded-lg bg-[#fafafa] text-[#000] font-bold text-sm
                     hover:bg-white active:scale-[0.98]
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <Spinner class="w-5 h-5 mx-auto text-black" />
              {:else}
                Sign In
              {/if}
            </button>

            <button
              onclick={() => { showPasswordForm = false; password = ''; }}
              disabled={isLoading}
              class="w-full py-2 px-6 rounded-lg text-[#888] hover:text-[#fafafa] font-medium
                     transition-colors duration-200 text-xs"
            >
              ← Back to login options
            </button>
          {/if}
        </div>

        <!-- Register Link -->
        <div class="text-center pt-4 border-t border-[#222]">
          <button
            onclick={onSwitchToRegister}
            class="text-[#888] hover:text-[#fafafa] font-medium text-xs transition-colors duration-200
                   underline underline-offset-4 decoration-[#333] hover:decoration-indigo-500/50"
          >
            Don't have an account? Create one
          </button>
        </div>
      </div>

      <!-- Security Note -->
      <div class="px-8 pb-6">
        <div class="flex items-center justify-center gap-2 text-[10px] text-[#444] uppercase tracking-widest font-bold">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: #fafafa;
    -webkit-box-shadow: 0 0 0px 1000px #0a0a0a inset;
    transition: background-color 5000s ease-in-out 0s;
  }
</style>

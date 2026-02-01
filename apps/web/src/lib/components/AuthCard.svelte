<!-- =========================================================================
AUTHENTICATION CARD (AuthCard.svelte)
============================================================================
A beautiful, modern authentication card with glassmorphism effects.
Features smooth animations, gradient backgrounds, and modern design patterns.

DESIGN FEATURES:
- Glassmorphism (backdrop blur, transparency)
- Animated gradient background
- Smooth transitions and hover effects
- Modern typography and spacing
- Accessible form elements
- Beautiful iconography
========================================================================== -->

<script lang="ts">
  import { Button, Input, Spinner } from '$components';
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

<!-- Main Container with Animated Background -->
<div class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Floating circles with blur -->
    <div class="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute top-1/2 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
  </div>

  <!-- Content Container -->
  <div class="relative z-10 flex min-h-screen items-center justify-center p-4">
    <!-- Glass Card -->
    <div class="w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
      <div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
        <!-- Header Section -->
        <div class="relative p-8 text-center">
          <!-- Logo Icon -->
          <div class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p class="text-white/70 text-sm">
            Sign in to access your notes
          </p>
        </div>

        <!-- Form Section -->
        <div class="px-8 pb-8 space-y-4">
          <!-- Username Input (always visible) -->
          <div class="space-y-2">
            <label for="auth-username" class="block text-sm font-medium text-white/90 ml-1">Username</label>
            <div class="relative">
              <input
                id="auth-username"
                type="text"
                bind:value={username}
                placeholder="Enter your username"
                class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                       focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                       transition-all duration-200 backdrop-blur-sm"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Password Form (toggled) -->
          {#if showPasswordForm}
            <div class="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label for="auth-password" class="block text-sm font-medium text-white/90 ml-1">Password</label>
              <div class="relative">
                <input
                  id="auth-password"
                  type="password"
                  bind:value={password}
                  placeholder="Enter your password"
                  class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                         transition-all duration-200 backdrop-blur-sm"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          {/if}

          <!-- Error Message -->
          {#if authState.status === 'error'}
            <div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {authState.error}
            </div>
          {/if}

          <!-- Loading State -->
          {#if authState.status === 'loading'}
            <div class="flex items-center justify-center py-4">
              <Spinner class="text-white" />
            </div>
          {/if}

          <!-- Action Buttons -->
          <div class="space-y-3 pt-2">
            {#if !showPasswordForm}
              <!-- Primary: Passkey -->
              <button
                onclick={handlePasskeyLogin}
                disabled={isLoading}
                class="w-full py-4 px-6 rounded-xl bg-white text-indigo-600 font-semibold 
                       shadow-lg shadow-white/25 hover:shadow-xl hover:shadow-white/30
                       hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 flex items-center justify-center gap-3
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Sign in with Passkey
              </button>

              <!-- Secondary: Password -->
              <button
                onclick={() => showPasswordForm = true}
                disabled={isLoading}
                class="w-full py-4 px-6 rounded-xl bg-white/10 text-white font-semibold border border-white/20
                       hover:bg-white/20 hover:border-white/30
                       transition-all duration-200 flex items-center justify-center gap-3
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Sign in with Password
              </button>
            {:else}
              <!-- Password Submit -->
              <button
                onclick={handlePasswordLogin}
                disabled={isLoading || !username || !password}
                class="w-full py-4 px-6 rounded-xl bg-white text-indigo-600 font-semibold 
                       shadow-lg shadow-white/25 hover:shadow-xl hover:shadow-white/30
                       hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Sign In
              </button>

              <!-- Back Button -->
              <button
                onclick={() => { showPasswordForm = false; password = ''; }}
                disabled={isLoading}
                class="w-full py-3 px-6 rounded-xl text-white/70 hover:text-white font-medium
                       transition-colors duration-200 text-sm"
              >
                ← Back to sign in options
              </button>
            {/if}
          </div>

          <!-- Divider -->
          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/20"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 text-xs font-medium text-white/50 bg-transparent">or</span>
            </div>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <button
              onclick={onSwitchToRegister}
              class="text-white/80 hover:text-white font-medium text-sm transition-colors duration-200
                     underline underline-offset-4 decoration-white/30 hover:decoration-white"
            >
              Create a new account
            </button>
          </div>
        </div>

        <!-- Security Note -->
        <div class="px-8 pb-6">
          <div class="flex items-center justify-center gap-2 text-xs text-white/50">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>End-to-end encrypted • Local-first</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Smooth input autofill styling */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: white;
    -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.1) inset;
    transition: background-color 5000s ease-in-out 0s;
  }
</style>

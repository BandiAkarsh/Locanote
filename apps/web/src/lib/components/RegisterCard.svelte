<!-- =========================================================================
REGISTRATION CARD (RegisterCard.svelte)
============================================================================
A beautiful registration interface with glassmorphism design.
Allows users to create accounts with passkey or password.

FEATURES:
- Beautiful gradient background with floating elements
- Glassmorphism card with backdrop blur
- Animated transitions between steps
- Method selection (Passkey vs Password)
- Real-time password validation feedback
- Loading states and error handling
========================================================================== -->

<script lang="ts">
  import { Spinner } from '$components';
  import type { AuthState } from '$auth/types';

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
  let selectedMethod: 'passkey' | 'password' | null = $state(null);
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

  // Handle registration
  async function handleRegister() {
    isLoading = true;
    
    if (selectedMethod === 'passkey') {
      await onRegisterPasskey(username);
    } else if (selectedMethod === 'password') {
      if (password !== confirmPassword) {
        authState = { status: 'error', error: 'Passwords do not match' };
        isLoading = false;
        return;
      }
      if (!validatePassword()) {
        isLoading = false;
        return;
      }
      await onRegisterPassword(username, password);
    }
    
    isLoading = false;
  }
</script>

<!-- Main Container with Animated Gradient -->
<div class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-10 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md transform transition-all duration-500 hover:scale-[1.01]">
      <!-- Glass Card -->
      <div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="p-8 text-center">
          <!-- Icon -->
          <div class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-3 transition-transform duration-300">
            <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">
            Create Account
          </h1>
          <p class="text-white/70 text-sm">
            Join Locanote and start collaborating
          </p>
        </div>

        <!-- Form Content -->
        <div class="px-8 pb-8 space-y-6">
          <!-- Username Input -->
          <div class="space-y-2">
            <label for="reg-username" class="block text-sm font-medium text-white/90 ml-1">Choose a username</label>
            <input
              id="reg-username"
              type="text"
              bind:value={username}
              placeholder="e.g., john_doe"
              class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                     focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                     transition-all duration-200 backdrop-blur-sm"
            />
          </div>

          <!-- Method Selection (only shown if no method selected) -->
          {#if !selectedMethod}
            <div class="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span class="block text-sm font-medium text-white/90 ml-1">Choose authentication method</span>
              
              <!-- Passkey Option -->
              <button
                onclick={() => selectedMethod = 'passkey'}
                class="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30
                       transition-all duration-200 text-left group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-semibold text-white">Passkey</div>
                    <div class="text-sm text-white/60">Face ID, fingerprint, or device PIN</div>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-white/40 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Password Option -->
              <button
                onclick={() => selectedMethod = 'password'}
                class="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30
                       transition-all duration-200 text-left group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-semibold text-white">Password</div>
                    <div class="text-sm text-white/60">Create a secure password</div>
                  </div>
                  <div class="ml-auto">
                    <svg class="w-5 h-5 text-white/40 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          {/if}

          <!-- Password Form -->
          {#if selectedMethod === 'password'}
            <div class="space-y-4 animate-in slide-in-from-right-2 duration-300">
              <div class="space-y-2">
                <label for="reg-password" class="block text-sm font-medium text-white/90 ml-1">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  bind:value={password}
                  placeholder="Create a strong password"
                  class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                         transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <div class="space-y-2">
                <label for="reg-confirm-password" class="block text-sm font-medium text-white/90 ml-1">Confirm password</label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  bind:value={confirmPassword}
                  placeholder="Confirm your password"
                  class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                         transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <!-- Password Requirements -->
              <div class="space-y-2 text-sm">
                <!-- Length requirement -->
                <div class="flex items-center gap-2" style="color: {password.length >= 8 ? '#4ade80' : 'rgba(255,255,255,0.6)'}">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {#if password.length >= 8}
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    {:else}
                      <circle cx="12" cy="12" r="10" stroke-width="2" />
                    {/if}
                  </svg>
                  <span>At least 8 characters</span>
                </div>
                
                <!-- Uppercase requirement -->
                <div class="flex items-center gap-2" style="color: {/[A-Z]/.test(password) ? '#4ade80' : 'rgba(255,255,255,0.6)'}">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {#if /[A-Z]/.test(password)}
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    {:else}
                      <circle cx="12" cy="12" r="10" stroke-width="2" />
                    {/if}
                  </svg>
                  <span>One uppercase letter</span>
                </div>
                
                <!-- Number requirement -->
                <div class="flex items-center gap-2" style="color: {/[0-9]/.test(password) ? '#4ade80' : 'rgba(255,255,255,0.6)'}">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {#if /[0-9]/.test(password)}
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    {:else}
                      <circle cx="12" cy="12" r="10" stroke-width="2" />
                    {/if}
                  </svg>
                  <span>One number</span>
                </div>
              </div>

              <!-- Change Method Button -->
              <button
                onclick={() => { selectedMethod = null; password = ''; confirmPassword = ''; }}
                class="text-white/60 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4"
              >
                Choose different method
              </button>
            </div>
          {/if}

          <!-- Passkey Confirmation -->
          {#if selectedMethod === 'passkey'}
            <div class="p-4 rounded-xl bg-white/10 border border-white/20 animate-in slide-in-from-right-2 duration-300">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-sm text-white/80">
                  <p class="font-medium text-white mb-1">Secure authentication</p>
                  <p>You'll use your device's biometric sensor (Face ID, fingerprint) or PIN to authenticate.</p>
                </div>
              </div>
              <button
                onclick={() => selectedMethod = null}
                class="mt-3 text-white/60 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4"
              >
                Choose different method
              </button>
            </div>
          {/if}

          <!-- Error Message -->
          {#if authState.status === 'error'}
            <div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2">
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

          <!-- Submit Button -->
          {#if selectedMethod}
            <button
              onclick={handleRegister}
              disabled={isLoading || !username || (selectedMethod === 'password' && (!password || password !== confirmPassword || passwordErrors.length > 0))}
              class="w-full py-4 px-6 rounded-xl bg-white text-fuchsia-600 font-semibold 
                     shadow-lg shadow-white/25 hover:shadow-xl hover:shadow-white/30
                     hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {selectedMethod === 'passkey' ? 'Create Account with Passkey' : 'Create Account'}
            </button>
          {/if}

          <!-- Divider -->
          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/20"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 text-xs font-medium text-white/50 bg-transparent">or</span>
            </div>
          </div>

          <!-- Login Link -->
          <div class="text-center">
            <button
              onclick={onSwitchToLogin}
              class="text-white/80 hover:text-white font-medium text-sm transition-colors duration-200
                     underline underline-offset-4 decoration-white/30 hover:decoration-white"
            >
              Already have an account? Sign in
            </button>
          </div>

          <!-- Security Note -->
          <div class="flex items-center justify-center gap-2 text-xs text-white/50 pt-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your data stays on your device</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

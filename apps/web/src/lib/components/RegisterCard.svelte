<!-- =========================================================================
REGISTRATION CARD (RegisterCard.svelte)
============================================================================ -->

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

<!-- Main Container -->
<div class="relative min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-indigo-500/30">
  <!-- Subtle Background Glow -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -bottom-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full opacity-50"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 w-full max-w-md">
    <!-- Redesigned Linear Card -->
    <div class="group relative rounded-2xl bg-[#111] border border-[#222] shadow-2xl transition-all duration-300 hover:border-[#333]">
      <!-- Top Subtle Glow Line -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <!-- Header -->
      <div class="p-8 pb-4 text-center">
        <!-- Minimal Logo Icon -->
        <div class="mx-auto mb-6 w-16 h-16 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors duration-500">
          <svg class="w-8 h-8 text-[#fafafa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-[#fafafa] mb-2 tracking-tight">
          Create Account
        </h1>
        <p class="text-[#888] text-sm">
          Join the local-first movement
        </p>
      </div>

      <!-- Form Content -->
      <div class="px-8 pb-8 space-y-6">
        <!-- Username Input -->
        <div class="space-y-2">
          <label for="reg-username" class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">
            Choose a username
          </label>
          <input
            id="reg-username"
            type="text"
            bind:value={username}
            placeholder="username"
            onkeydown={(e) => {
              if (e.key === 'Enter' && username) {
                if (selectedMethod) handleRegister();
              }
              if (e.key === 'Escape' && selectedMethod) {
                selectedMethod = null;
              }
            }}
            class="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-[#fafafa] placeholder-[#444]
                   focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                   transition-all duration-200"
          />
        </div>

        <!-- Method Selection -->
        {#if !selectedMethod}
          <div class="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">
              Select method
            </span>
            
            <button
              onclick={() => selectedMethod = 'passkey'}
              onkeydown={(e) => e.key === 'Enter' && (selectedMethod = 'passkey')}
              class="w-full p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#161616] hover:border-[#333]
                     transition-all duration-200 text-left group/btn"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center group-hover/btn:border-indigo-500/50 transition-colors">
                  <svg class="w-5 h-5 text-[#fafafa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-[#fafafa] text-sm">Passkey</div>
                  <div class="text-xs text-[#666]">Biometrics or device PIN</div>
                </div>
                <div class="ml-auto">
                  <svg class="w-4 h-4 text-[#444] group-hover/btn:text-indigo-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onclick={() => selectedMethod = 'password'}
              onkeydown={(e) => e.key === 'Enter' && (selectedMethod = 'password')}
              class="w-full p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#161616] hover:border-[#333]
                     transition-all duration-200 text-left group/btn"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center group-hover/btn:border-indigo-500/50 transition-colors">
                  <svg class="w-5 h-5 text-[#fafafa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-[#fafafa] text-sm">Password</div>
                  <div class="text-xs text-[#666]">Traditional credentials</div>
                </div>
                <div class="ml-auto">
                  <svg class="w-4 h-4 text-[#444] group-hover/btn:text-indigo-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <label for="reg-password" class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">Password</label>
              <input
                id="reg-password"
                type="password"
                bind:value={password}
                placeholder="••••••••"
                onkeydown={(e) => {
                  if (e.key === 'Enter' && username && password && confirmPassword) {
                    handleRegister();
                  }
                  if (e.key === 'Escape') {
                    selectedMethod = null;
                    password = '';
                    confirmPassword = '';
                  }
                }}
                class="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-[#fafafa] placeholder-[#444]
                       focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                       transition-all duration-200"
              />
            </div>

            <div class="space-y-2">
              <label for="reg-confirm-password" class="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] ml-1">Confirm password</label>
              <input
                id="reg-confirm-password"
                type="password"
                bind:value={confirmPassword}
                placeholder="••••••••"
                onkeydown={(e) => {
                  if (e.key === 'Enter' && username && password && confirmPassword) {
                    handleRegister();
                  }
                  if (e.key === 'Escape') {
                    selectedMethod = null;
                    password = '';
                    confirmPassword = '';
                  }
                }}
                class="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-[#fafafa] placeholder-[#444]
                       focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                       transition-all duration-200"
              />
            </div>

            <!-- Password Requirements -->
            <div class="space-y-2 py-1">
              <div class="flex items-center gap-2 text-xs" style="color: {password.length >= 8 ? '#4ade80' : '#444'}">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {#if password.length >= 8}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  {:else}
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                  {/if}
                </svg>
                <span>8+ characters</span>
              </div>
              
              <div class="flex items-center gap-2 text-xs" style="color: {/[A-Z]/.test(password) ? '#4ade80' : '#444'}">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {#if /[A-Z]/.test(password)}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  {:else}
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                  {/if}
                </svg>
                <span>Uppercase letter</span>
              </div>
              
              <div class="flex items-center gap-2 text-xs" style="color: {/[0-9]/.test(password) ? '#4ade80' : '#444'}">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {#if /[0-9]/.test(password)}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  {:else}
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                  {/if}
                </svg>
                <span>Number</span>
              </div>
            </div>

            <button
              onclick={() => { selectedMethod = null; password = ''; confirmPassword = ''; }}
              class="text-[#666] hover:text-[#fafafa] text-[10px] uppercase tracking-widest font-bold transition-colors duration-200"
            >
              ← Different method
            </button>
          </div>
        {/if}

        <!-- Passkey Confirmation -->
        {#if selectedMethod === 'passkey'}
          <div class="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] animate-in slide-in-from-right-2 duration-300">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-indigo-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-xs text-[#888]">
                <p class="font-bold text-[#fafafa] mb-1">Modern Security</p>
                <p>Passkeys are more secure than passwords and use your device's biometric authentication.</p>
              </div>
            </div>
            <button
              onclick={() => selectedMethod = null}
              class="mt-4 text-[#666] hover:text-[#fafafa] text-[10px] uppercase tracking-widest font-bold transition-colors duration-200"
            >
              ← Different method
            </button>
          </div>
        {/if}

        <!-- Submit Button -->
        {#if selectedMethod}
          <button
            onclick={handleRegister}
            disabled={isLoading || !username || (selectedMethod === 'password' && (!password || password !== confirmPassword || passwordErrors.length > 0))}
            class="w-full py-3 px-6 rounded-lg bg-[#fafafa] text-[#000] font-bold text-sm
                   hover:bg-white active:scale-[0.98]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isLoading}
              <Spinner class="w-5 h-5 mx-auto text-black" />
            {:else}
              {selectedMethod === 'passkey' ? 'Register Passkey' : 'Create Account'}
            {/if}
          </button>
        {/if}

        <!-- Login Link -->
        <div class="text-center pt-4 border-t border-[#222]">
          <button
            onclick={onSwitchToLogin}
            class="text-[#888] hover:text-[#fafafa] font-medium text-xs transition-colors duration-200
                   underline underline-offset-4 decoration-[#333] hover:decoration-indigo-500/50"
          >
            Already have an account? Sign in
          </button>
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

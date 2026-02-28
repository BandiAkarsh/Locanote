<!-- =========================================================================
AUTH CARD COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Beautiful authentication card with passkey and password support.
======================================================================== -->

<script lang="ts">
  import { Button, Input, Spinner } from "$components";

  type AuthStatus =
    | "idle"
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

  type Props = {
    authState: {
      status: AuthStatus;
      message?: string;
      error?: string;
    };
    onPasskeyLogin: () => void;
    onPasswordLogin: (username: string, password: string) => void;
    onSwitchToRegister: () => void;
  };

  let {
    authState,
    onPasskeyLogin,
    onPasswordLogin,
    onSwitchToRegister,
  }: Props = $props();

  let username = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let activeTab = $state<"passkey" | "password">("passkey");

  function handlePasswordSubmit(e: Event) {
    e.preventDefault();
    if (username && password) {
      onPasswordLogin(username, password);
    }
  }

  const isLoading = $derived(authState.status === "loading");
</script>

<div class="nm-auth-page">
  <div class="nm-auth-card">
    <!-- Logo & Header -->
    <div class="nm-auth-header">
      <div class="nm-auth-logo">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <h1 class="nm-auth-title">Welcome back</h1>
      <p class="nm-auth-subtitle">Sign in to continue to Locanote</p>
    </div>

    <!-- Tab Switcher -->
    <div class="auth-tabs">
      <button
        class="auth-tab"
        class:active={activeTab === "passkey"}
        onclick={() => (activeTab = "passkey")}
        type="button"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        Passkey
      </button>
      <button
        class="auth-tab"
        class:active={activeTab === "password"}
        onclick={() => (activeTab = "password")}
        type="button"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Password
      </button>
    </div>

    <!-- Passkey Section -->
    {#if activeTab === "passkey"}
      <div class="auth-section nm-animate-fade-up">
        <button
          class="nm-btn nm-btn-primary nm-btn-lg nm-btn-full"
          onclick={onPasskeyLogin}
          disabled={isLoading}
        >
          {#if isLoading}
            <Spinner size="sm" class="text-white" />
            <span>{authState.message || "Authenticating..."}</span>
          {:else}
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Sign in with Passkey
          {/if}
        </button>

        <div class="auth-hint">
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            >Use your device's biometric authentication (Face ID, Touch ID,
            etc.)</span
          >
        </div>
      </div>
    {/if}

    <!-- Password Section -->
    {#if activeTab === "password"}
      <form
        class="auth-section nm-animate-fade-up"
        onsubmit={handlePasswordSubmit}
      >
        <div class="auth-fields">
          <Input
            label="Username"
            type="text"
            bind:value={username}
            placeholder="Enter your username"
            required
            disabled={isLoading}
            autocomplete="username"
          />

          <div class="password-field">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              onclick={() => (showPassword = !showPassword)}
              tabindex="-1"
            >
              {#if showPassword}
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              {:else}
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        {#if authState.error}
          <div class="auth-error nm-animate-fade-in">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{authState.error}</span>
          </div>
        {/if}

        <button
          type="submit"
          class="nm-btn nm-btn-primary nm-btn-lg nm-btn-full"
          disabled={isLoading || !username || !password}
        >
          {#if isLoading}
            <Spinner size="sm" class="text-white" />
            <span>{authState.message || "Signing in..."}</span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>
    {/if}

    <!-- Footer -->
    <div class="nm-auth-footer">
      <span>Don't have an account?</span>
      <button class="nm-btn nm-btn-text" onclick={onSwitchToRegister}>
        Create account
      </button>
    </div>
  </div>
</div>

<style>
  .auth-tabs {
    display: flex;
    gap: var(--nm-space-2);
    padding: var(--nm-space-1);
    background: var(--nm-bg-secondary);
    border-radius: var(--nm-radius);
    margin-bottom: var(--nm-space-6);
  }

  .auth-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--nm-space-2);
    padding: var(--nm-space-3) var(--nm-space-4);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--nm-text-secondary);
    background: transparent;
    border: none;
    border-radius: var(--nm-radius-sm);
    cursor: pointer;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
  }

  .auth-tab:hover {
    color: var(--nm-text-primary);
    background: var(--nm-bg-elevated);
  }

  .auth-tab.active {
    color: var(--nm-text-primary);
    background: var(--nm-bg-elevated);
    box-shadow: var(--nm-shadow-sm);
  }

  .auth-section {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-5);
  }

  .auth-fields {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-4);
  }

  .password-field {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: var(--nm-space-3);
    top: 38px;
    padding: var(--nm-space-1);
    color: var(--nm-text-tertiary);
    background: transparent;
    border: none;
    border-radius: var(--nm-radius-sm);
    cursor: pointer;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
  }

  .password-toggle:hover {
    color: var(--nm-text-secondary);
    background: var(--nm-bg-tertiary);
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: var(--nm-space-2);
    padding: var(--nm-space-3) var(--nm-space-4);
    background: var(--nm-error-light);
    color: var(--nm-error);
    border-radius: var(--nm-radius);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .auth-hint {
    display: flex;
    align-items: flex-start;
    gap: var(--nm-space-2);
    padding: var(--nm-space-3) var(--nm-space-4);
    background: var(--nm-accent-muted);
    color: var(--nm-text-secondary);
    border-radius: var(--nm-radius);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .auth-hint svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--nm-accent);
  }
</style>

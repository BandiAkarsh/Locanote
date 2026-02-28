<!-- =========================================================================
REGISTER CARD COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Beautiful registration card with passkey and password support.
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
    onRegisterPasskey: (username: string) => void;
    onRegisterPassword: (username: string, password: string) => void;
    onSwitchToLogin: () => void;
  };

  let {
    authState,
    onRegisterPasskey,
    onRegisterPassword,
    onSwitchToLogin,
  }: Props = $props();

  let username = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let showPassword = $state(false);
  let activeTab = $state<"passkey" | "password">("passkey");

  function handlePasskeySubmit(e: Event) {
    e.preventDefault();
    if (username) {
      onRegisterPasskey(username);
    }
  }

  function handlePasswordSubmit(e: Event) {
    e.preventDefault();
    if (username && password && password === confirmPassword) {
      onRegisterPassword(username, password);
    }
  }

  const isLoading = $derived(authState.status === "loading");

  // Password strength calculation
  const passwordStrength = $derived.by(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  });

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "var(--nm-error)",
    "var(--nm-warning)",
    "#3b82f6",
    "var(--nm-success)",
  ];

  const passwordsMatch = $derived(
    password === confirmPassword && password !== "",
  );
  const canSubmitPassword = $derived(
    username &&
      password &&
      confirmPassword &&
      passwordsMatch &&
      passwordStrength >= 2,
  );
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h1 class="nm-auth-title">Create your account</h1>
      <p class="nm-auth-subtitle">Join Locanote and start writing</p>
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
      <form
        class="auth-section nm-animate-fade-up"
        onsubmit={handlePasskeySubmit}
      >
        <div class="auth-fields">
          <Input
            label="Choose a username"
            type="text"
            bind:value={username}
            placeholder="e.g., johndoe"
            required
            disabled={isLoading}
            autocomplete="username"
            hint="This will be your unique identifier"
          />
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
          disabled={isLoading || !username}
        >
          {#if isLoading}
            <Spinner size="sm" class="text-white" />
            <span>{authState.message || "Creating account..."}</span>
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
            Create account with Passkey
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span
            >Passkeys are more secure than passwords and can't be forgotten or
            stolen</span
          >
        </div>
      </form>
    {/if}

    <!-- Password Section -->
    {#if activeTab === "password"}
      <form
        class="auth-section nm-animate-fade-up"
        onsubmit={handlePasswordSubmit}
      >
        <div class="auth-fields">
          <Input
            label="Choose a username"
            type="text"
            bind:value={username}
            placeholder="e.g., johndoe"
            required
            disabled={isLoading}
            autocomplete="username"
          />

          <div class="password-field">
            <Input
              label="Create password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              placeholder="Min 8 characters"
              required
              disabled={isLoading}
              autocomplete="new-password"
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

          <!-- Password Strength -->
          {#if password}
            <div class="password-strength">
              <div class="strength-bars">
                {#each [1, 2, 3, 4] as i}
                  <div
                    class="strength-bar"
                    class:active={passwordStrength >= i}
                    style:background-color={passwordStrength >= i
                      ? strengthColors[passwordStrength - 1]
                      : "var(--nm-border)"}
                  ></div>
                {/each}
              </div>
              <span
                class="strength-label"
                style:color={strengthColors[passwordStrength - 1]}
              >
                {strengthLabels[passwordStrength - 1]}
              </span>
            </div>
          {/if}

          <div class="password-field">
            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              bind:value={confirmPassword}
              placeholder="Re-enter your password"
              required
              disabled={isLoading}
              autocomplete="new-password"
              error={confirmPassword && !passwordsMatch
                ? "Passwords don't match"
                : undefined}
            />
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
          disabled={isLoading || !canSubmitPassword}
        >
          {#if isLoading}
            <Spinner size="sm" class="text-white" />
            <span>{authState.message || "Creating account..."}</span>
          {:else}
            Create account
          {/if}
        </button>
      </form>
    {/if}

    <!-- Footer -->
    <div class="nm-auth-footer">
      <span>Already have an account?</span>
      <button class="nm-btn nm-btn-text" onclick={onSwitchToLogin}>
        Sign in
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: var(--nm-space-3);
    margin-top: calc(-1 * var(--nm-space-2));
  }

  .strength-bars {
    display: flex;
    gap: var(--nm-space-1);
    flex: 1;
  }

  .strength-bar {
    height: 4px;
    flex: 1;
    border-radius: 2px;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
  }

  .strength-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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

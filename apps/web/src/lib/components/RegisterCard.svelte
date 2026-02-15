<!-- =========================================================================
NOTEPAD REGISTER CARD - Simple Registration
============================================================================ -->

<script lang="ts">
  import { Spinner } from "$components";
  import type { AuthState } from "$auth/types";

  let {
    authState = $bindable({ status: "idle" }),
    onRegisterPasskey,
    onRegisterPassword,
    onSwitchToLogin,
  }: {
    authState: AuthState;
    onRegisterPasskey: (username: string) => void;
    onRegisterPassword: (username: string, password: string) => void;
    onSwitchToLogin: () => void;
  } = $props();

  let username = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let selectedMethod = $state<"passkey" | "password" | null>(null);
  let isLoading = $state(false);

  async function handleRegister() {
    if (!username) return;
    isLoading = true;
    if (selectedMethod === "passkey") {
      await onRegisterPasskey(username);
    } else {
      await onRegisterPassword(username, password);
    }
    isLoading = false;
  }
</script>

<div class="np-auth-page">
  <div class="np-auth-card">
    <div class="np-auth-logo">
      <svg
        class="np-auth-logo-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M12 4v16m8-8H4" />
      </svg>
      <h1 class="np-auth-title">Create Account</h1>
      <p class="np-auth-subtitle">Start taking notes</p>
    </div>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}
    >
      <div>
        <label class="np-label" for="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          bind:value={username}
          placeholder="Choose a username"
          class="np-input"
        />
      </div>

      {#if !selectedMethod}
        <div class="space-y-2 pt-2">
          <p class="text-sm text-[var(--np-text-muted)] mb-2">
            Choose how to sign in:
          </p>
          <button
            type="button"
            onclick={() => (selectedMethod = "passkey")}
            class="np-btn w-full justify-start"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Use Face ID or Fingerprint
          </button>
          <button
            type="button"
            onclick={() => (selectedMethod = "password")}
            class="np-btn w-full justify-start"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Create a Password
          </button>
        </div>
      {:else if selectedMethod === "password"}
        <div class="space-y-3">
          <div>
            <label class="np-label" for="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              bind:value={password}
              placeholder="Create a password"
              class="np-input"
            />
          </div>
          <div>
            <label class="np-label" for="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              bind:value={confirmPassword}
              placeholder="Confirm your password"
              class="np-input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading ||
              !username ||
              !password ||
              password !== confirmPassword}
            class="np-btn np-btn-primary w-full"
          >
            {#if isLoading}
              <Spinner class="w-4 h-4" />
            {:else}
              Create Account
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (selectedMethod = null)}
            class="np-btn w-full"
          >
            ← Back
          </button>
        </div>
      {:else}
        <div class="space-y-3">
          <p class="text-sm text-[var(--np-text-muted)]">
            We'll use your device's biometrics to sign you in as <strong
              >{username}</strong
            >.
          </p>
          <button
            type="submit"
            disabled={isLoading || !username}
            class="np-btn np-btn-primary w-full"
          >
            {#if isLoading}
              <Spinner class="w-4 h-4" />
            {:else}
              Set Up Passkey
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (selectedMethod = null)}
            class="np-btn w-full"
          >
            ← Back
          </button>
        </div>
      {/if}
    </form>

    {#if authState.status === "error"}
      <div
        class="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm"
      >
        {authState.error}
      </div>
    {/if}

    <div class="mt-6 pt-6 border-t border-[var(--np-border)] text-center">
      <button
        onclick={onSwitchToLogin}
        class="text-sm text-[var(--np-accent)] hover:underline"
      >
        Already have an account? Sign in
      </button>
    </div>
  </div>
</div>

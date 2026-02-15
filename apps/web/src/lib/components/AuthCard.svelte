<!-- =========================================================================
NOTEPAD AUTH CARD - Simple Login
============================================================================ -->

<script lang="ts">
  import { Spinner } from "$components";
  import type { AuthState } from "$auth/types";

  let {
    authState = $bindable({ status: "idle" }),
    onPasskeyLogin,
    onPasswordLogin,
    onSwitchToRegister,
  }: {
    authState: AuthState;
    onPasskeyLogin: () => void;
    onPasswordLogin: (username: string, password: string) => void;
    onSwitchToRegister: () => void;
  } = $props();

  let username = $state("");
  let password = $state("");
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
        <path
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      <h1 class="np-auth-title">Notes</h1>
      <p class="np-auth-subtitle">Sign in to access your notes</p>
    </div>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        if (showPasswordForm) handlePasswordLogin();
        else handlePasskeyLogin();
      }}
    >
      <div>
        <label class="np-label" for="auth-username">Username</label>
        <input
          id="auth-username"
          type="text"
          bind:value={username}
          placeholder="Enter your username"
          class="np-input"
        />
      </div>

      {#if showPasswordForm}
        <div>
          <label class="np-label" for="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            bind:value={password}
            placeholder="Enter your password"
            class="np-input"
          />
        </div>
      {/if}

      {#if authState.status === "error"}
        <div
          class="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm"
        >
          {authState.error}
        </div>
      {/if}

      <div class="space-y-2 pt-2">
        {#if !showPasswordForm}
          <button
            type="button"
            onclick={handlePasskeyLogin}
            disabled={isLoading || !username}
            class="np-btn np-btn-primary w-full"
          >
            {#if isLoading}
              <Spinner class="w-4 h-4" />
            {:else}
              Sign in with Passkey
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (showPasswordForm = true)}
            class="np-btn w-full"
          >
            Sign in with Password
          </button>
        {:else}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            class="np-btn np-btn-primary w-full"
          >
            {#if isLoading}
              <Spinner class="w-4 h-4" />
            {:else}
              Sign In
            {/if}
          </button>
          <button
            type="button"
            onclick={() => {
              showPasswordForm = false;
              password = "";
            }}
            class="np-btn w-full"
          >
            ← Use Passkey
          </button>
        {/if}
      </div>
    </form>

    <div class="mt-6 pt-6 border-t border-[var(--np-border)] text-center">
      <button
        onclick={onSwitchToRegister}
        class="text-sm text-[var(--np-accent)] hover:underline"
      >
        Create an account
      </button>
    </div>
  </div>
</div>

<!-- =========================================================================
LANDING PAGE (+page.svelte)
==========================================================================
The main entry point of the application with beautiful authentication.

FEATURES:
- Beautiful gradient background with animated elements
- Glassmorphism design
- Simple local login (no password required for MVP)
- Smooth transitions between states
========================================================================== -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$stores/auth.svelte";

  // Current view mode
  let viewMode = $state<"login" | "register">("login");
  let username = $state("");
  let isLoading = $state(false);
  let error = $state("");

  // Initialize on mount
  $effect(() => {
    auth.initialize();
  });

  // Redirect to /app if already authenticated
  $effect(() => {
    if (auth.isAuthenticated) {
      goto("/app");
    }
  });

  function switchMode(mode: "login" | "register") {
    viewMode = mode;
    error = "";
  }

  // Handle login
  async function handleLogin() {
    if (!username.trim()) {
      error = "Please enter a username";
      return;
    }

    isLoading = true;
    error = "";

    const result = auth.login(username.trim());

    if (result.success) {
      goto("/app");
    } else {
      error = result.error || "Login failed";
    }

    isLoading = false;
  }

  // Handle register
  async function handleRegister() {
    if (!username.trim()) {
      error = "Please enter a username";
      return;
    }

    if (username.trim().length < 2) {
      error = "Username must be at least 2 characters";
      return;
    }

    isLoading = true;
    error = "";

    const result = auth.register(username.trim());

    if (result.success) {
      goto("/app");
    } else {
      error = result.error || "Registration failed";
    }

    isLoading = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      if (viewMode === "login") handleLogin();
      else handleRegister();
    }
  }
</script>

<svelte:head>
  <title>Locanote - Local-First Collaborative Notes</title>
  <meta
    name="description"
    content="Local-first, privacy-focused collaborative note-taking"
  />
</svelte:head>

<div class="landing-page">
  <div class="background-effects">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
  </div>

  <div class="content">
    <div class="logo">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      <h1>Locanote</h1>
    </div>

    <p class="tagline">Local-first collaborative notes</p>

    <div class="auth-card">
      <h2>{viewMode === "login" ? "Welcome back" : "Create account"}</h2>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="input-group">
        <input
          type="text"
          bind:value={username}
          placeholder="Enter your username"
          onkeydown={handleKeydown}
          disabled={isLoading}
        />
      </div>

      <button
        class="primary-btn"
        onclick={viewMode === "login" ? handleLogin : handleRegister}
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="spinner"></span>
        {:else}
          {viewMode === "login" ? "Sign In" : "Create Account"}
        {/if}
      </button>

      <div class="switch-mode">
        {#if viewMode === "login"}
          <p>
            Don't have an account? <button
              onclick={() => switchMode("register")}>Sign up</button
            >
          </p>
        {:else}
          <p>
            Already have an account? <button onclick={() => switchMode("login")}
              >Sign in</button
            >
          </p>
        {/if}
      </div>

      <div class="features">
        <div class="feature">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
        <div class="feature">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>P2P collaboration</span>
        </div>
        <div class="feature">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
            />
          </svg>
          <span>Works offline</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .landing-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ui-bg, #fafafa);
    position: relative;
    overflow: hidden;
  }

  .background-effects {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    top: -100px;
    left: -100px;
    animation: float 20s ease-in-out infinite;
  }

  .orb-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #ec4899, #f43f5e);
    bottom: -50px;
    right: -50px;
    animation: float 25s ease-in-out infinite reverse;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(30px, 30px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .logo svg {
    width: 48px;
    height: 48px;
    color: var(--ui-primary, #6366f1);
  }

  .logo h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--ui-text, #1a1a1a);
    margin: 0;
  }

  .tagline {
    color: var(--ui-text-muted, #666);
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }

  .auth-card {
    background: var(--ui-surface, #fff);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 400px;
    margin: 0 auto;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .auth-card h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ui-text, #1a1a1a);
    margin-bottom: 1.5rem;
  }

  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .input-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--ui-border, #e5e7eb);
    border-radius: 0.5rem;
    font-size: 1rem;
    outline: none;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    background: var(--ui-bg, #fafafa);
    color: var(--ui-text, #1a1a1a);
  }

  .input-group input:focus {
    border-color: var(--ui-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .primary-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--ui-primary, #6366f1);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s,
      transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .primary-btn:hover:not(:disabled) {
    background: var(--ui-primary-hover, #4f46e5);
  }

  .primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .switch-mode {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--ui-border, #e5e7eb);
  }

  .switch-mode p {
    color: var(--ui-text-muted, #666);
    font-size: 0.875rem;
    margin: 0;
  }

  .switch-mode button {
    background: none;
    border: none;
    color: var(--ui-primary, #6366f1);
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .switch-mode button:hover {
    text-decoration: underline;
  }

  .features {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--ui-text-muted, #666);
    font-size: 0.875rem;
  }

  .feature svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  /* Responsive Styles */
  @media (max-width: 768px) {
    .content {
      padding: 1.5rem;
    }

    .logo h1 {
      font-size: 2rem;
    }

    .tagline {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .auth-card {
      padding: 1.5rem;
      margin: 0 1rem;
    }

    .auth-card h2 {
      font-size: 1.25rem;
    }

    .gradient-orb {
      width: 250px;
      height: 250px;
    }

    .orb-1 {
      width: 200px;
      height: 200px;
      top: -50px;
      left: -50px;
    }

    .orb-2 {
      width: 150px;
      height: 150px;
      bottom: -25px;
      right: -25px;
    }
  }

  @media (max-width: 480px) {
    .content {
      padding: 1rem;
    }

    .logo {
      gap: 0.5rem;
    }

    .logo svg {
      width: 36px;
      height: 36px;
    }

    .logo h1 {
      font-size: 1.75rem;
    }

    .tagline {
      font-size: 0.875rem;
    }

    .auth-card {
      padding: 1.25rem;
      margin: 0 0.5rem;
      border-radius: 0.75rem;
    }

    .auth-card h2 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
    }

    .input-group input {
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
    }

    .primary-btn {
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
    }

    .features {
      margin-top: 1.5rem;
      gap: 0.5rem;
    }

    .feature {
      font-size: 0.8125rem;
    }

    .gradient-orb {
      width: 150px;
      height: 150px;
      filter: blur(60px);
    }
  }
</style>

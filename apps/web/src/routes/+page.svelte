<!-- =========================================================================
LANDING PAGE - Beautiful Glass Design
========================================================================== -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let username = $state("");
  let isLoading = $state(false);
  let error = $state("");
  let isRegister = $state(false);
  let mounted = $state(false);

  // Check session BEFORE mount to prevent flash
  function checkSession() {
    if (typeof window === "undefined") return false;

    try {
      const stored = localStorage.getItem("locanote_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.expiresAt > Date.now()) {
          return true;
        }
      }
    } catch {
      // Invalid session
    }
    return false;
  }

  // Run session check immediately (before render)
  if (typeof window !== "undefined" && checkSession()) {
    // Will redirect in onMount to avoid SSR issues
  }

  onMount(() => {
    mounted = true;
    // Double-check session after mount (handles edge cases)
    if (checkSession()) {
      goto("/app", { replaceState: true });
    }
  });

  function handleSubmit() {
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

    const session = {
      userId: username.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      username: username.trim(),
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem("locanote_session", JSON.stringify(session));
    goto("/app", { replaceState: true });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }
</script>

<div class="landing" class:mounted>
  <!-- Animated Background -->
  <div class="bg-effects">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid"></div>
  </div>

  <div class="content">
    <!-- Logo -->
    <div class="logo-section">
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
      </div>
      <h1>Locanote</h1>
      <p class="tagline">Your notes, synced everywhere.</p>
    </div>

    <!-- Auth Card -->
    <div class="glass-card">
      <div class="tabs">
        <button
          class="tab"
          class:active={!isRegister}
          onclick={() => (isRegister = false)}
        >
          Sign In
        </button>
        <button
          class="tab"
          class:active={isRegister}
          onclick={() => (isRegister = true)}
        >
          Create Account
        </button>
      </div>

      <div class="form">
        <div class="input-group">
          <input
            type="text"
            bind:value={username}
            onkeydown={handleKeydown}
            placeholder="Choose a username"
            class="input"
            autocomplete="off"
          />
        </div>

        {#if error}
          <div class="error">{error}</div>
        {/if}

        <button onclick={handleSubmit} disabled={isLoading} class="submit-btn">
          {#if isLoading}
            <span class="spinner"></span>
          {:else}
            {isRegister ? "Create Account" : "Continue"}
          {/if}
        </button>
      </div>

      <div class="divider">
        <span>or</span>
      </div>

      <button class="passkey-btn">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        Continue with Passkey
      </button>
    </div>

    <!-- Features -->
    <div class="features">
      <div class="feature">
        <span class="icon">🔒</span>
        <span>End-to-end encrypted</span>
      </div>
      <div class="feature">
        <span class="icon">⚡</span>
        <span>Real-time collaboration</span>
      </div>
      <div class="feature">
        <span class="icon">📱</span>
        <span>Works offline</span>
      </div>
    </div>

    <p class="footer">By continuing, you agree to our Terms of Service</p>
  </div>
</div>

<style>
  .landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    position: relative;
    overflow: hidden;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .landing.mounted {
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Background Effects */
  .bg-effects {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.5;
  }

  .orb-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    top: -200px;
    left: -200px;
    animation: float 20s ease-in-out infinite;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    bottom: -100px;
    right: -100px;
    animation: float 25s ease-in-out infinite reverse;
  }

  .orb-3 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 15s ease-in-out infinite;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(30px, 30px) scale(1.05);
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
    max-width: 420px;
    width: 100%;
  }

  .logo-section {
    margin-bottom: 2rem;
  }

  .logo {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
    animation: float 6s ease-in-out infinite;
  }

  .logo svg {
    width: 36px;
    height: 36px;
    color: white;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .tagline {
    color: #64748b;
    font-size: 1.125rem;
    margin: 0;
  }

  /* Glass Card */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 24px;
    padding: 2rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.02),
      0 20px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 4px;
  }

  .tab {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab.active {
    background: white;
    color: #1e293b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    position: relative;
  }

  .input {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    background: white;
    color: #1e293b;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .input::placeholder {
    color: #94a3b8;
  }

  .error {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    text-align: left;
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
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

  .divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  .passkey-btn {
    width: 100%;
    padding: 0.875rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .passkey-btn:hover {
    border-color: #6366f1;
    background: #f8fafc;
  }

  .passkey-btn svg {
    width: 20px;
    height: 20px;
  }

  .features {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .icon {
    font-size: 1rem;
  }

  .footer {
    margin-top: 1.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .landing {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }

    h1 {
      color: #f1f5f9;
    }

    .tagline,
    .feature {
      color: #94a3b8;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .tabs {
      background: #1e293b;
    }

    .tab:not(.active) {
      color: #94a3b8;
    }

    .tab.active {
      background: #334155;
      color: #f1f5f9;
    }

    .input {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }

    .input::placeholder {
      color: #64748b;
    }

    .passkey-btn {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }

    .passkey-btn:hover {
      background: #334155;
    }

    .divider::before,
    .divider::after {
      background: #334155;
    }
  }

  /* Mobile */
  @media (max-width: 480px) {
    h1 {
      font-size: 2rem;
    }

    .glass-card {
      padding: 1.5rem;
    }

    .features {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
</style>

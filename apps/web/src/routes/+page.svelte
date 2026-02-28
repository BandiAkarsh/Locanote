<!-- =========================================================================
MINIMAL LANDING PAGE - Debug Version
========================================================================== -->

<script lang="ts">
  import { goto } from "$app/navigation";

  let username = $state("");
  let isLoading = $state(false);
  let error = $state("");
  let message = $state("Click works!");

  function handleLogin() {
    if (!username.trim()) {
      error = "Please enter a username";
      return;
    }

    isLoading = true;
    error = "";

    // Simple localStorage auth
    const session = {
      userId: username.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      username: username.trim(),
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem("locanote_session", JSON.stringify(session));
    goto("/app");
  }
</script>

<div class="page">
  <div class="container">
    <h1>Locanote</h1>
    <p class="tagline">Local-first collaborative notes</p>

    <div class="card">
      <h2>Sign In</h2>

      <p class="debug">{message}</p>

      <input
        type="text"
        bind:value={username}
        placeholder="Enter username"
        class="input"
      />

      <button onclick={handleLogin} disabled={isLoading} class="button">
        {isLoading ? "Loading..." : "Sign In"}
      </button>

      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>

    <p class="features">
      🔒 End-to-end encrypted<br />
      ⚡ P2P collaboration<br />
      📱 Works offline
    </p>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .container {
    text-align: center;
    padding: 2rem;
    max-width: 400px;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0;
    color: #1a1a1a;
  }

  .tagline {
    color: #666;
    margin-bottom: 2rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
  }

  .debug {
    color: green;
    font-size: 0.8rem;
    padding: 4px;
    background: #e8f5e9;
    margin-bottom: 1rem;
  }

  .input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }

  .input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .button {
    width: 100%;
    padding: 0.75rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
  }

  .button:hover {
    background: #4f46e5;
  }

  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    color: #dc2626;
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .features {
    margin-top: 2rem;
    color: #666;
    font-size: 0.875rem;
    line-height: 1.8;
  }
</style>

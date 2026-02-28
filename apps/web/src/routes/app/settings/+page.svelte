<!-- =========================================================================
SETTINGS PAGE - 2026 Neo-Minimalist Design
========================================================================
Clean preferences page with organized sections.

FEATURES:
- Tab-based navigation
- Appearance settings
- Account management
- Accessibility options
======================================================================== -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth, theme } from "$stores";
  import { Button, Modal, Toggle, Card } from "$components";
  import { isBrowser } from "$utils/browser";

  // Local state
  let showDeleteConfirm = $state(false);
  let activeTab = $state<"appearance" | "account">("appearance");

  function goBack() {
    if (isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/app");
    }
  }

  function handleLogout() {
    auth.logout();
    goto("/");
  }

  function handleDeleteAccount() {
    showDeleteConfirm = false;
    // Implement account deletion logic
    auth.logout();
    goto("/");
  }
</script>

<svelte:head>
  <title>Settings - Locanote</title>
</svelte:head>

<div class="settings-page">
  <!-- Header -->
  <header class="settings-header">
    <button
      onclick={goBack}
      class="nm-btn nm-btn-ghost nm-btn-icon"
      aria-label="Go back"
    >
      <svg
        class="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 class="settings-title">Settings</h1>
    <div class="settings-spacer"></div>
  </header>

  <!-- Tabs -->
  <div class="settings-tabs">
    <button
      class="settings-tab"
      class:active={activeTab === "appearance"}
      onclick={() => (activeTab = "appearance")}
    >
      <svg
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
      Appearance
    </button>
    <button
      class="settings-tab"
      class:active={activeTab === "account"}
      onclick={() => (activeTab = "account")}
    >
      <svg
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      Account
    </button>
  </div>

  <!-- Content -->
  <div class="settings-content">
    {#if activeTab === "appearance"}
      <div class="settings-section nm-animate-fade-up">
        <Card variant="flat" padding="lg">
          {#snippet header()}
            <div class="section-header">
              <h2 class="section-title">Theme</h2>
              <p class="section-description">
                Choose your preferred color scheme
              </p>
            </div>
          {/snippet}

          <div class="theme-options">
            <button
              class="theme-option"
              class:active={!theme.isDark}
              onclick={() => theme.setLight()}
            >
              <div class="theme-preview light">
                <div class="preview-content"></div>
              </div>
              <span class="theme-label">Light</span>
              {#if !theme.isDark}
                <svg
                  class="theme-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>

            <button
              class="theme-option"
              class:active={theme.isDark}
              onclick={() => theme.setDark()}
            >
              <div class="theme-preview dark">
                <div class="preview-content"></div>
              </div>
              <span class="theme-label">Dark</span>
              {#if theme.isDark}
                <svg
                  class="theme-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          </div>
        </Card>

        <Card variant="flat" padding="lg">
          {#snippet header()}
            <div class="section-header">
              <h2 class="section-title">Accessibility</h2>
              <p class="section-description">Customize your experience</p>
            </div>
          {/snippet}

          <div class="accessibility-options">
            <div class="accessibility-item">
              <div class="accessibility-info">
                <h3 class="accessibility-title">Reduced Motion</h3>
                <p class="accessibility-description">
                  Minimize animations throughout the app
                </p>
              </div>
              <Toggle
                checked={false}
                onchange={() => {}}
                label="Enable reduced motion"
              />
            </div>

            <div class="accessibility-item">
              <div class="accessibility-info">
                <h3 class="accessibility-title">High Contrast</h3>
                <p class="accessibility-description">
                  Increase contrast for better visibility
                </p>
              </div>
              <Toggle
                checked={false}
                onchange={() => {}}
                label="Enable high contrast"
              />
            </div>
          </div>
        </Card>
      </div>
    {:else}
      <div class="settings-section nm-animate-fade-up">
        <Card variant="flat" padding="lg">
          {#snippet header()}
            <div class="section-header">
              <h2 class="section-title">Account Information</h2>
              <p class="section-description">Your account details</p>
            </div>
          {/snippet}

          <div class="account-info">
            <div class="info-item">
              <span class="info-label">Username</span>
              <span class="info-value">{auth.session?.username}</span>
            </div>
            <div class="info-item">
              <span class="info-label">User ID</span>
              <span class="info-value info-muted">{auth.session?.userId}</span>
            </div>
          </div>

          <div class="account-actions">
            <Button variant="secondary" fullWidth onclick={handleLogout}>
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </Button>
          </div>
        </Card>

        <Card variant="outlined" padding="lg" class="danger-zone">
          {#snippet header()}
            <div class="section-header">
              <h2 class="section-title danger">Danger Zone</h2>
              <p class="section-description">Irreversible actions</p>
            </div>
          {/snippet}

          <div class="danger-content">
            <p class="danger-text">
              Deleting your account will permanently remove all your notes and
              data. This action cannot be undone.
            </p>
            <Button
              variant="danger"
              fullWidth
              onclick={() => (showDeleteConfirm = true)}
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    {/if}
  </div>
</div>

<!-- Delete Confirmation Modal -->
<Modal bind:open={showDeleteConfirm} title="Delete Account?">
  <div class="delete-confirmation">
    <div class="delete-warning-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <p class="delete-message">
      This will permanently delete your account and all your notes. This action
      cannot be undone.
    </p>
  </div>

  {#snippet footer()}
    <button
      class="nm-btn nm-btn-secondary"
      onclick={() => (showDeleteConfirm = false)}
    >
      Cancel
    </button>
    <button
      class="nm-btn"
      style="background: var(--nm-error); color: white;"
      onclick={handleDeleteAccount}
    >
      Delete Account
    </button>
  {/snippet}
</Modal>

<style>
  .settings-page {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--nm-space-6);
    min-height: 100vh;
  }

  /* Header */
  .settings-header {
    display: flex;
    align-items: center;
    gap: var(--nm-space-4);
    margin-bottom: var(--nm-space-8);
  }

  .settings-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--nm-text-primary);
    flex: 1;
  }

  .settings-spacer {
    width: 40px;
  }

  /* Tabs */
  .settings-tabs {
    display: flex;
    gap: var(--nm-space-1);
    padding: var(--nm-space-1);
    background: var(--nm-bg-secondary);
    border-radius: var(--nm-radius);
    margin-bottom: var(--nm-space-8);
  }

  .settings-tab {
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

  .settings-tab:hover {
    color: var(--nm-text-primary);
    background: var(--nm-bg-elevated);
  }

  .settings-tab.active {
    color: var(--nm-text-primary);
    background: var(--nm-bg-elevated);
    box-shadow: var(--nm-shadow-sm);
  }

  /* Content */
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-6);
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-6);
  }

  /* Section Header */
  .section-header {
    margin-bottom: var(--nm-space-2);
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nm-text-primary);
    margin-bottom: var(--nm-space-1);
  }

  .section-title.danger {
    color: var(--nm-error);
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--nm-text-secondary);
  }

  /* Theme Options */
  .theme-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--nm-space-4);
  }

  .theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--nm-space-3);
    padding: var(--nm-space-4);
    background: transparent;
    border: 2px solid var(--nm-border);
    border-radius: var(--nm-radius-lg);
    cursor: pointer;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
    position: relative;
  }

  .theme-option:hover {
    border-color: var(--nm-border-hover);
  }

  .theme-option.active {
    border-color: var(--nm-accent);
  }

  .theme-preview {
    width: 100%;
    height: 80px;
    border-radius: var(--nm-radius);
    border: 1px solid var(--nm-border);
    overflow: hidden;
    position: relative;
  }

  .theme-preview.light {
    background: #fafaf8;
  }

  .theme-preview.dark {
    background: #0f0f0f;
  }

  .preview-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 8px;
    border-radius: 4px;
    background: var(--nm-border);
  }

  .theme-preview.light .preview-content {
    background: #e5e5e5;
  }

  .theme-preview.dark .preview-content {
    background: #2a2a2a;
  }

  .theme-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--nm-text-primary);
  }

  .theme-check {
    position: absolute;
    top: var(--nm-space-3);
    right: var(--nm-space-3);
    width: 20px;
    height: 20px;
    color: var(--nm-accent);
  }

  /* Accessibility */
  .accessibility-options {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-4);
  }

  .accessibility-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--nm-space-4);
    padding: var(--nm-space-3) 0;
    border-bottom: 1px solid var(--nm-border);
  }

  .accessibility-item:last-child {
    border-bottom: none;
  }

  .accessibility-info {
    flex: 1;
  }

  .accessibility-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--nm-text-primary);
    margin-bottom: var(--nm-space-1);
  }

  .accessibility-description {
    font-size: 0.8125rem;
    color: var(--nm-text-secondary);
  }

  /* Account */
  .account-info {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-4);
    margin-bottom: var(--nm-space-6);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--nm-space-3) 0;
    border-bottom: 1px solid var(--nm-border);
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 0.875rem;
    color: var(--nm-text-secondary);
  }

  .info-value {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--nm-text-primary);
  }

  .info-muted {
    color: var(--nm-text-tertiary);
    font-family: var(--nm-font-mono);
    font-size: 0.8125rem;
  }

  .account-actions {
    display: flex;
    gap: var(--nm-space-3);
  }

  /* Danger Zone */
  .danger-zone {
    border-color: var(--nm-error) !important;
    background: var(--nm-error-light) !important;
  }

  .danger-content {
    display: flex;
    flex-direction: column;
    gap: var(--nm-space-4);
  }

  .danger-text {
    font-size: 0.875rem;
    color: var(--nm-text-secondary);
    line-height: 1.5;
  }

  /* Delete Confirmation */
  .delete-confirmation {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--nm-space-4);
  }

  .delete-warning-icon {
    width: 48px;
    height: 48px;
    color: var(--nm-error);
  }

  .delete-warning-icon svg {
    width: 100%;
    height: 100%;
  }

  .delete-message {
    font-size: 0.9375rem;
    color: var(--nm-text-primary);
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .settings-page {
      padding: var(--nm-space-4);
    }

    .theme-options {
      grid-template-columns: 1fr;
    }
  }
</style>

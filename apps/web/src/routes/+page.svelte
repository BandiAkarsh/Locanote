<!-- =========================================================================
LANDING PAGE (+page.svelte)
============================================================================
The main entry point of the application with beautiful authentication.

FEATURES:
- Beautiful gradient background with animated elements
- Glassmorphism design
- Login and Registration forms
- Smooth transitions between states
========================================================================== -->

<script lang="ts">
  import { AuthCard, RegisterCard } from '$components';
  import { auth } from '$stores/auth.svelte';
  import { loginWithPasskey } from '$auth/webauthn-login.svelte';
  import { loginWithPassword } from '$auth/password-login.svelte';
  import { registerWithPasskey } from '$auth/webauthn.svelte';
  import { registerWithPassword } from '$auth/password.svelte';
  import { goto } from '$app/navigation';

  // Initialize auth state on mount
  $effect(() => {
    auth.initialize();
  });

  // Redirect to /app if already authenticated
  $effect(() => {
    if (auth.isAuthenticated) {
      goto('/app');
    }
  });

  // Current view mode
  let viewMode = $state<'login' | 'register'>('login');

  // Handle passkey login
  async function handlePasskeyLogin() {
    auth.setLoading('Authenticating with passkey...');
    const result = await loginWithPasskey();
    
    if (result.success) {
      auth.handleAuthSuccess(result);
    } else {
      auth.handleAuthError(result);
    }
  }

  // Handle password login
  async function handlePasswordLogin(username: string, password: string) {
    auth.setLoading('Authenticating...');
    const result = await loginWithPassword(username, password);
    
    if (result.success) {
      auth.handleAuthSuccess(result);
    } else {
      auth.handleAuthError(result);
    }
  }

  // Handle passkey registration
  async function handleRegisterPasskey(username: string) {
    auth.setLoading('Creating your account...');
    const result = await registerWithPasskey(username);
    
    if (result.success) {
      // Auto-login after registration
      auth.handleAuthSuccess({
        success: true,
        userId: result.userId,
        username: result.username,
        method: 'passkey',
        credentialId: result.credentialId
      });
    } else {
      auth.handleAuthError(result);
    }
  }

  // Handle password registration
  async function handleRegisterPassword(username: string, password: string) {
    auth.setLoading('Creating your account...');
    const result = await registerWithPassword(username, password);
    
    if (result.success) {
      // Auto-login after registration
      auth.handleAuthSuccess({
        success: true,
        userId: result.userId,
        username: result.username,
        method: 'password',
        credentialId: result.credentialId
      });
    } else {
      auth.handleAuthError(result);
    }
  }
</script>

<svelte:head>
  <title>Locanote - Local-First Collaborative Notes</title>
  <meta name="description" content="A secure, local-first note-taking app with real-time collaboration. Your notes stay on your device." />
</svelte:head>

{#if viewMode === 'login'}
  <AuthCard
    bind:authState={auth.state}
    onPasskeyLogin={handlePasskeyLogin}
    onPasswordLogin={handlePasswordLogin}
    onSwitchToRegister={() => {
      viewMode = 'register';
    }}
  />
{:else}
  <RegisterCard
    bind:authState={auth.state}
    onRegisterPasskey={handleRegisterPasskey}
    onRegisterPassword={handleRegisterPassword}
    onSwitchToLogin={() => viewMode = 'login'}
  />
{/if}

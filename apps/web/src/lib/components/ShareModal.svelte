<!-- =========================================================================
SHARE MODAL COMPONENT (ShareModal.svelte)
============================================================================ -->

<script lang="ts">
  import { Modal, Button, Input, Toggle } from '$components';
  import { onMount } from 'svelte';
  import { getRoomKey } from '$crypto/e2e';
  import { uint8ArrayToBase64Url } from '$utils/browser';
  import { protectNote, getNote } from '$lib/services/notes.svelte';
  import type { Note } from '$db';

  interface Props {
    open: boolean;
    title?: string;
    noteId: string;
    baseUrl: string;
    noteTitle?: string;
    isProtected?: boolean;
    onUpdate?: () => void;
  }

  let {
    open = $bindable(false),
    title = 'Share Note',
    noteId = '',
    baseUrl = '',
    noteTitle = 'Check out this note on Locanote',
    isProtected = false,
    onUpdate
  }: Props = $props();

  let hasShareApi = $state(false);
  let isPasswordEnabled = $state(false);
  let password = $state('');
  let isSaving = $state(false);
  let currentNote = $state<Note | null>(null);
  
  // Sync internal state with prop
  $effect(() => {
    isPasswordEnabled = isProtected;
    if (open && noteId) {
      getNote(noteId).then(n => currentNote = n || null);
    }
  });

  // Compute final URL
  const shareUrl = $derived.by(() => {
    if (!noteId) return baseUrl;
    
    // If it is password protected, I don't include the key in the URL,
    // but I DO include the protection flag and the salt.
    if (isPasswordEnabled && isProtected && currentNote?.passwordSalt) {
      const url = new URL(baseUrl);
      url.searchParams.set('p', '1');
      url.searchParams.set('s', currentNote.passwordSalt);
      return url.toString();
    }

    const key = getRoomKey(noteId);
    if (!key) return baseUrl;
    
    const base64Key = uint8ArrayToBase64Url(key);
    // Append key to hash so it is not sent to the server
    return `${baseUrl}#key=${base64Key}`;
  });

  onMount(() => {
    hasShareApi = !!navigator.share;
  });

  async function handleTogglePassword() {
    if (isSaving) return;
    
    // If I am turning it off
    if (!isPasswordEnabled && isProtected) {
      isSaving = true;
      await protectNote(noteId);
      onUpdate?.();
      isSaving = false;
    }
  }

  async function handleApplyPassword() {
    if (!password) return;
    isSaving = true;
    await protectNote(noteId, password);
    onUpdate?.();
    isSaving = false;
    password = ''; // Clear after applying
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z',
      color: '#25D366',
      href: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + ': ' + u)}`
    },
    {
      name: 'Telegram',
      icon: 'M20.665 3.717l-17.73 6.837c-1.213.486-1.205 1.163-.222 1.467l4.552 1.42l10.532-6.645c.498-.303.953-.14.578.192l-8.533 7.7l-.33 4.955c.488 0 .704-.223.977-.485l2.35-2.285l4.886 3.61c.9.496 1.545.24 1.77-.83l3.205-15.1c.33-1.32-.505-1.92-1.365-1.52z',
      color: '#0088cc',
      href: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`
    },
    {
      name: 'X (Twitter)',
      icon: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z',
      color: '#000000',
      href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`
    },
    {
      name: 'Facebook',
      icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
      color: '#1877F2',
      href: (u: string, t: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`
    }
  ];

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: noteTitle,
        text: 'Check out this collaborative note',
        url: shareUrl
      });
      open = false;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  }
</script>

<Modal bind:open title={title}>
  <div class="space-y-6">
    <!-- Security Options -->
    <div class="themed-card p-4 bg-primary/5 border-primary/20">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="font-bold text-[var(--ui-text)]">Password Protection</h4>
          <p class="text-xs text-[var(--ui-text-muted)]">Require a password to view this note</p>
        </div>
        <Toggle bind:checked={isPasswordEnabled} onchange={handleTogglePassword} label="Enable" id="password-protection-toggle" />
      </div>

      {#if isPasswordEnabled}
        <div class="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
          {#if !isProtected}
            <div class="flex gap-2">
              <Input 
                type="password" 
                placeholder="Set a secret password" 
                bind:value={password}
                class="flex-1"
                size="sm"
              />
              <Button size="sm" onclick={handleApplyPassword} loading={isSaving} disabled={!password}>
                Apply
              </Button>
            </div>
          {:else}
            <div class="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 p-2 rounded-lg">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Password Protected (Secure Link)
            </div>
            <p class="text-[10px] text-[var(--ui-text-muted)] italic">
              * The encryption key is now hidden from the link. Collaborators must know the password.
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Native Share (if available) -->
    {#if hasShareApi}
      <Button fullWidth onclick={handleNativeShare} class="bg-primary text-white mb-4">
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share via Device
      </Button>
      
      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-[var(--ui-border)]"></div></div>
        <div class="relative flex justify-center text-xs uppercase tracking-widest font-bold text-[var(--ui-text-muted)]"><span class="bg-[var(--ui-surface)] px-2">Social Platforms</span></div>
      </div>
    {/if}

    <!-- Platform Buttons Grid -->
    <div class="grid grid-cols-2 gap-4">
      {#each shareOptions as option}
        <a
          href={option.href(shareUrl, noteTitle)}
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--ui-bg)] border border-[var(--ui-border)] hover:border-primary/50 transition-all group"
          onclick={() => open = false}
        >
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
            style="background-color: {option.color}20"
          >
            <svg class="w-6 h-6" style="fill: {option.color}" viewBox="0 0 24 24">
              <path d={option.icon} />
            </svg>
          </div>
          <span class="text-sm font-bold text-[var(--ui-text)]">{option.name}</span>
        </a>
      {/each}
    </div>

    <!-- URL Display & Copy -->
    <div class="pt-4 border-t border-[var(--ui-border)]">
      <div class="flex items-center gap-2 p-2 bg-[var(--ui-bg)] rounded-xl border border-[var(--ui-border)]">
        <input 
          type="text" 
          readonly 
          value={shareUrl} 
          class="flex-1 bg-transparent text-xs font-mono text-[var(--ui-text-muted)] outline-none px-2 truncate"
        />
        <Button size="sm" onclick={copyLink}>
          Copy
        </Button>
      </div>
    </div>
  </div>
</Modal>

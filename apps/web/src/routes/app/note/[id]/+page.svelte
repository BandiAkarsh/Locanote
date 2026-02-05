<!-- =========================================================================
NOTE EDITOR PAGE (+page.svelte for /app/note/[id])
============================================================================ -->

<script lang="ts">
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { onMount } from "svelte";
  import Editor from "$lib/editor/Editor.svelte";
  import IntentToolbar from "$lib/editor/IntentToolbar.svelte";
  import { Button, ShareModal, Modal, Input, ExportModal } from "$components";
  import {
    getNote,
    getNoteForCollaboration,
    updateNoteTitle,
  } from "$lib/services/notes.svelte";
  import { auth, ui, networkStatus } from "$stores";
  import { isBrowser, base64UrlToUint8Array } from "$utils/browser";
  import {
    storeRoomKey,
    hasRoomKey,
    deriveKeyFromPassword,
    protectRoomWithPassword,
  } from "$crypto/e2e";
  import { setupKeyboardShortcuts } from "$lib/keyboard/shortcuts";
  import { intent } from "$lib/services/intent.svelte";
  import { openDocument } from "$crdt/doc.svelte";
  import { fly } from "svelte/transition";
  import type { Note } from "$db";
  import type { Editor as TiptapEditor } from "@tiptap/core";

  // Svelte 5 reactive route param
  const noteId = $derived(page.params.id || "");

  let note = $state<Note | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let editorInstance = $state.raw<TiptapEditor | null>(null);
  let isShareModalOpen = $state(false);
  let isExportModalOpen = $state(false);
  let isProtectModalOpen = $state(false);
  let templateContent = $state<any>(null);

  // Editing Title State
  let isEditingTitle = $state(false);
  let editedTitle = $state("");

  // Protection State
  let protectPassword = $state("");
  let protectConfirmPassword = $state("");
  let protectError = $state<string | null>(null);

  // Password Prompt State
  let showPasswordPrompt = $state(false);
  let passwordAttempt = $state("");
  let passwordError = $state<string | null>(null);
  let currentSalt = $state<string | null>(null);

  const currentUser = $derived({
    name: auth.session?.username || "Anonymous",
    color: "#6366f1",
    id: auth.session?.userId || "anonymous",
  });

  onMount(() => {
    // 1. E2EE Key Extraction from URL
    if (isBrowser && window.location.hash.startsWith("#key=")) {
      try {
        const base64UrlKey = window.location.hash.slice(5);
        const currentId = page.params.id; // Local narrowing for TS
        if (base64UrlKey && currentId) {
          const keyBytes = base64UrlToUint8Array(base64UrlKey);
          storeRoomKey(currentId, keyBytes);
          replaceState(window.location.pathname, {});
        }
      } catch (err) {
        console.error("[E2E] Key extraction failed:", err);
      }
    }
  });

  // Reactive Note Loader
  $effect(() => {
    const currentId = page.params.id;
    if (currentId) {
      loadNoteData(currentId);

      // Sync Yjs Title to IndexedDB metadata
      const docInfo = openDocument(currentId);
      const handleTitleUpdate = () => {
        const newTitle = docInfo.title.toString();
        if (newTitle && note && note.title !== newTitle) {
          console.log(
            "[Sync] Updating local metadata title from Yjs:",
            newTitle,
          );
          updateNoteTitle(currentId, newTitle).then((updated) => {
            if (updated) note = updated;
          });
        }
      };

      docInfo.title.observe(handleTitleUpdate);

      return () => {
        docInfo.title.unobserve(handleTitleUpdate);
        docInfo.destroy();
      };
    }
  });

  async function loadNoteData(id: string) {
    if (!id) return;
    try {
      isLoading = true;
      const loadedNote = await getNoteForCollaboration(id);

      // Safety check: Has the ID changed while we were loading?
      if (page.params.id !== id) return;

      if (!loadedNote) {
        error = "Neural link failed. Access denied or portal destroyed.";
      } else {
        note = loadedNote;

        if (note.isProtected && !hasRoomKey(id)) {
          currentSalt = note.passwordSalt || null;
          showPasswordPrompt = true;
        }

        // Check for template content
        if (isBrowser) {
          const templateKey = `template-content-${id}`;
          const storedTemplate = sessionStorage.getItem(templateKey);
          if (storedTemplate) {
            try {
              templateContent = JSON.parse(storedTemplate);
              sessionStorage.removeItem(templateKey);
            } catch (err) {}
          }
        }
      }
    } catch (err) {
      error = "Quantum interference detected. Could not stabilize portal.";
    } finally {
      isLoading = false;
    }
  }

  async function handleTitleSubmit() {
    const currentId = page.params.id;
    if (!currentId || !editedTitle.trim() || editedTitle === note?.title) {
      isEditingTitle = false;
      return;
    }
    try {
      await updateNoteTitle(currentId, editedTitle.trim());
      if (note) note.title = editedTitle.trim();
      isEditingTitle = false;
    } catch (err) {}
  }

  function startEditingTitle() {
    if (note) {
      editedTitle = note.title;
      isEditingTitle = true;
    }
  }

  async function handleProtectNote() {
    const currentId = page.params.id;
    if (!currentId) return;
    if (protectPassword !== protectConfirmPassword) {
      protectError = "Neural patterns do not match.";
      return;
    }
    try {
      protectRoomWithPassword(currentId, protectPassword);
      await refreshNote();
      isProtectModalOpen = false;
      protectPassword = "";
    } catch (err) {
      protectError = "Failed to secure portal.";
    }
  }

  async function handlePasswordSubmit() {
    const currentId = page.params.id;
    if (!currentSalt || !currentId) return;
    try {
      const saltBuffer = base64UrlToUint8Array(currentSalt);
      const { key } = deriveKeyFromPassword(passwordAttempt, saltBuffer);
      storeRoomKey(currentId, key);
      window.location.reload();
    } catch (err) {
      passwordError = "Invalid decryption key.";
    }
  }

  async function refreshNote() {
    const currentId = page.params.id;
    if (!currentId) return;
    const loadedNote = await getNote(currentId);
    if (loadedNote) note = loadedNote;
  }

  function goBack() {
    // Smart Back: Use history if available, else fallback to dashboard
    if (isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/app");
    }
  }

  function handleEditorReady(editor: TiptapEditor) {
    editorInstance = editor;
    if (isBrowser) (window as any).editorInstance = editor;
    if (editor) {
      setupKeyboardShortcuts(editor, {
        onClose: () => {
          if (isShareModalOpen) isShareModalOpen = false;
          else if (isExportModalOpen) isExportModalOpen = false;
        },
      });
    }
  }
</script>

<div class="flex flex-col h-screen overflow-hidden">
  <!-- 1. ADAPTIVE HEADER -->
  <header
    class="glass-2 border-b border-[var(--ui-border)] px-4 sm:px-8 py-6 z-50 flex items-center justify-between transition-all duration-1000"
  >
    <div class="flex items-center gap-6">
      <button
        onclick={goBack}
        class="p-3 glass-2 rounded-2xl text-[var(--ui-text-muted)] hover:text-primary transition-all hover:scale-110 active:scale-95"
        aria-label="Exit Portal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
        >
      </button>

      {#if note}
        <div class="flex flex-col max-w-[200px] sm:max-w-md">
          <div class="flex items-center gap-3">
            {#if isEditingTitle}
              <!-- svelte-ignore a11y_autofocus -->
              <input
                type="text"
                bind:value={editedTitle}
                onblur={handleTitleSubmit}
                onkeydown={(e) => {
                  if (e.key === "Enter") handleTitleSubmit();
                }}
                class="bg-transparent border-b-2 border-primary outline-none text-2xl font-black text-[var(--ui-text)] w-full max-w-sm tracking-tight"
                autofocus
              />
            {:else}
              <button
                onclick={startEditingTitle}
                class="text-left group flex items-center gap-3 hover:scale-[1.02] transition-transform"
              >
                <h1
                  class="text-2xl sm:text-4xl font-black text-[var(--ui-text)] tracking-tighter leading-none truncate transition-all"
                  style="view-transition-name: note-title-{noteId}"
                >
                  {note.title}
                </h1>
                <div
                  class="p-2 rounded-xl bg-primary/5 border border-primary/10 opacity-40 group-hover:opacity-100 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path
                      d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                    /><path d="m15 5 4 4" /></svg
                  >
                </div>
              </button>
            {/if}

            <div class="flex items-center gap-2">
              {#if note.isProtected}
                <div class="text-primary animate-pulse" title="Secured">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                      ry="2"
                    /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg
                  >
                </div>
              {/if}
            </div>
          </div>
          <span
            class="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--ui-text-muted)]"
          >
            Neural Link: {networkStatus.peerCount} Active
          </span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 sm:gap-4">
      <Button
        variant="ghost"
        size="sm"
        onclick={() => (isExportModalOpen = true)}
      >
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
          ><path
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          /></svg
        >
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => (isProtectModalOpen = true)}
        class="group/shield relative overflow-visible"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform group-hover/shield:scale-110"
          ><path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"
          /></svg
        >
        <span
          class="ml-2 hidden sm:inline uppercase tracking-widest text-[10px] font-black"
          >Secure</span
        >

        {#if note && note.isProtected}
          <div
            class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--ui-surface)] animate-pulse"
          ></div>
        {/if}
      </Button>
      <Button
        variant="primary"
        size="sm"
        onclick={() => (isShareModalOpen = true)}
      >
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="3"
          ><path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          /></svg
        >
      </Button>
    </div>
  </header>

  <!-- 2. GenUI ADAPTIVE TOOLBAR -->
  <div class="px-4 sm:px-12 py-2 sm:py-8 flex justify-center">
    <div class="w-full max-w-6xl">
      <IntentToolbar editor={editorInstance} />
    </div>
  </div>

  <!-- 3. IMMERSIVE EDITOR -->
  <main class="flex-1 overflow-hidden p-2 sm:p-10 relative">
    {#if isLoading}
      <div class="h-full flex items-center justify-center">
        <div
          class="w-20 h-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin"
        ></div>
      </div>
    {:else if error}
      <div class="h-full flex items-center justify-center" in:fly={{ y: 20 }}>
        <div class="glass-2 p-12 rounded-[3rem] text-center space-y-6 max-w-md">
          <div
            class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-glow"
          >
            <svg
              class="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
              ><path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              /></svg
            >
          </div>
          <h2 class="text-2xl font-black text-[var(--ui-text)]">
            Portal Error
          </h2>
          <p class="text-[var(--ui-text-muted)] font-medium">{error}</p>
          <div class="flex gap-4">
            <Button variant="secondary" fullWidth onclick={goBack}>Abort</Button
            >
            <Button
              variant="primary"
              fullWidth
              onclick={() => {
                const id = page.params.id;
                if (id) loadNoteData(id);
              }}>Retry</Button
            >
          </div>
        </div>
      </div>
    {:else if note && noteId && (!note.isProtected || hasRoomKey(noteId))}
      <div
        class="h-full max-w-6xl mx-auto glass-2 rounded-2xl sm:rounded-[3rem] p-0 sm:p-4 shadow-inner"
        in:fly={{ y: 20, duration: 1000 }}
      >
        <Editor
          {noteId}
          user={currentUser}
          initialContent={templateContent}
          onEditorReady={handleEditorReady}
        />
      </div>
    {/if}
  </main>

  <!-- Modals -->
  {#if note && noteId}
    <ShareModal
      bind:open={isShareModalOpen}
      baseUrl={isBrowser
        ? window.location.origin + window.location.pathname
        : ""}
      {noteId}
      noteTitle={note.title}
    />
    <ExportModal
      bind:open={isExportModalOpen}
      noteTitle={note.title}
      noteContent={editorInstance?.getJSON?.() || {}}
    />
    <Modal
      bind:open={isProtectModalOpen}
      title="Neural Seal"
      type="sheet"
      onEnter={handleProtectNote}
    >
      <form
        class="space-y-6 text-center"
        onsubmit={(e) => {
          e.preventDefault();
          handleProtectNote();
        }}
      >
        <p class="text-sm text-[var(--ui-text-muted)] font-medium">
          Add a password to this quantum portal. It is stored <span
            class="text-primary font-black">only on your device.</span
          >
        </p>
        <Input
          type="password"
          label="Portal Key"
          bind:value={protectPassword}
          autocomplete="new-password"
        />
        <Input
          type="password"
          label="Confirm Key"
          bind:value={protectConfirmPassword}
          error={protectError || undefined}
          autocomplete="new-password"
        />
        <Button variant="primary" fullWidth type="submit">Activate Seal</Button>
      </form>
    </Modal>
  {/if}

  <Modal
    bind:open={showPasswordPrompt}
    title="Portal Sealed"
    closeOnBackdrop={false}
    closeOnEscape={false}
  >
    <form
      onsubmit={(e) => {
        e.preventDefault();
        handlePasswordSubmit();
      }}
      class="space-y-8 text-center"
    >
      <div
        class="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto animate-pulse"
      >
        <svg
          class="w-12 h-12 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
          ><path
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          /></svg
        >
      </div>
      <p class="text-[var(--ui-text-muted)] font-medium">
        This sector is encrypted. Enter the Portal Key to stabilize.
      </p>
      <!-- svelte-ignore a11y_autofocus -->
      <Input
        type="password"
        label="Key"
        bind:value={passwordAttempt}
        error={passwordError || undefined}
        autofocus
        onkeydown={(e) => {
          if (e.key === "Enter") handlePasswordSubmit();
        }}
      />
      <div class="flex gap-4">
        <Button variant="secondary" fullWidth onclick={goBack}>Abort</Button
        ><Button variant="primary" fullWidth type="submit">Unlock</Button>
      </div>
    </form>
  </Modal>
</div>

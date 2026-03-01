<!-- =========================================================================
NOTEPAD EDITOR PAGE - Notepad++ Style Layout
============================================================================ -->

<script lang="ts">
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { onMount } from "svelte";
  import Editor from "$lib/editor/Editor.svelte";
  import { Button, ShareModal, Modal, ExportModal } from "$components";
  import {
    getNote,
    getNoteForCollaboration,
    updateNoteTitle,
  } from "$lib/services/notes.svelte";
  import { auth, networkStatus } from "$stores";
  import { isBrowser, base64UrlToUint8Array } from "$utils/browser";
  import {
    storeRoomKey,
    hasRoomKey,
    deriveKeyFromPassword,
    protectRoomWithPassword,
  } from "$crypto/e2e";
  import { openDocument } from "$crdt/doc.svelte";
  import { voice } from "$lib/services/voice.svelte";
  import type { Note } from "$db";
  import type { Editor as TiptapEditor } from "@tiptap/core";

  const noteId = $derived(page.params.id || "");

  let note = $state<Note | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let editorInstance = $state.raw<TiptapEditor | null>(null);
  let isShareModalOpen = $state(false);
  let isExportModalOpen = $state(false);
  let isProtectModalOpen = $state(false);

  let protectPassword = $state("");
  let protectConfirmPassword = $state("");
  let protectError = $state<string | null>(null);

  let showPasswordPrompt = $state(false);
  let passwordAttempt = $state("");
  let passwordError = $state<string | null>(null);
  let currentSalt = $state<string | null>(null);

  const currentUser = $derived({
    name: auth.session?.username || "Anonymous",
    color: "#0066cc",
    id: auth.session?.userId || "anonymous",
  });

  onMount(() => {
    if (isBrowser && window.location.hash.startsWith("#key=")) {
      try {
        const base64UrlKey = window.location.hash.slice(5);
        const currentId = page.params.id;
        if (base64UrlKey && currentId) {
          const keyBytes = base64UrlToUint8Array(base64UrlKey);
          storeRoomKey(currentId, keyBytes);
          replaceState(window.location.pathname, {});
        }
      } catch (err) {
        console.error("Key extraction failed:", err);
      }
    }
  });

  // Abort controller for cancelling async operations
  let abortController: AbortController | null = null;

  $effect(() => {
    const currentId = page.params.id;
    if (!currentId) return;

    // Cancel any pending request
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    loadNoteData(currentId, abortController.signal);

    // Set up document observer
    const docInfo = openDocument(currentId);
    const handleTitleUpdate = () => {
      const newTitle = docInfo.title.toString();
      if (newTitle && note && note.title !== newTitle) {
        updateNoteTitle(currentId, newTitle).then((updated) => {
          if (updated) note = updated;
        });
      }
    };

    docInfo.title.observe(handleTitleUpdate);

    return () => {
      // Cleanup when effect re-runs or component unmounts
      docInfo.title.unobserve(handleTitleUpdate);
      docInfo.destroy();
      if (abortController) {
        abortController.abort();
      }
    };
  });

  async function loadNoteData(id: string, signal?: AbortSignal) {
    if (!id) return;

    // Check if already aborted
    if (signal?.aborted) return;

    try {
      isLoading = true;
      error = null;

      const loadedNote = await getNoteForCollaboration(id);

      // Check if still on same note (handles navigation away)
      if (signal?.aborted) return;
      if (page.params.id !== id) return;

      if (!loadedNote) {
        error = "Note not found.";
      } else {
        note = loadedNote;

        if (note.isProtected && !hasRoomKey(id)) {
          currentSalt = note.passwordSalt || null;
          showPasswordPrompt = true;
        }
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === "AbortError") return;
      error = "Failed to load note.";
    } finally {
      // Only set loading false if not aborted
      if (!signal?.aborted) {
        isLoading = false;
      }
    }
  }

  async function handleTitleChange(newTitle: string) {
    const currentId = page.params.id;
    if (!currentId || !newTitle.trim()) return;
    try {
      await updateNoteTitle(currentId, newTitle.trim());
      if (note) note.title = newTitle.trim();
    } catch (err) {}
  }

  async function handleProtectNote() {
    const currentId = page.params.id;
    if (!currentId) return;
    if (protectPassword !== protectConfirmPassword) {
      protectError = "Passwords do not match.";
      return;
    }
    try {
      protectRoomWithPassword(currentId, protectPassword);
      await refreshNote();
      isProtectModalOpen = false;
      protectPassword = "";
      protectConfirmPassword = "";
    } catch (err) {
      protectError = "Failed to add password.";
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
      passwordError = "Wrong password.";
    }
  }

  async function refreshNote() {
    const currentId = page.params.id;
    if (!currentId) return;
    const loadedNote = await getNote(currentId);
    if (loadedNote) note = loadedNote;
  }

  function handleEditorReady(editor: TiptapEditor) {
    editorInstance = editor;
    if (isBrowser) (window as any).editorInstance = editor;

    // Set up voice dictation to insert text into editor
    voice.onResult = (text: string, isInterim: boolean) => {
      if (!isInterim && text) {
        editor
          .chain()
          .focus()
          .insertContent(text + " ")
          .run();
      }
    };
  }
</script>

<div class="np-container">
  <!-- Left Sidebar - Notes List Only -->
  <aside class="np-sidebar">
    <div class="np-sidebar-header">
      <button
        class="np-btn np-btn-icon"
        onclick={() => goto("/app")}
        title="Back to all notes"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <span class="np-sidebar-title">Notes</span>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      {#if note}
        <div class="text-sm text-[var(--ui-text-muted)] mb-2">Current Note</div>
        <div class="np-note-item active mb-2">
          <div class="np-note-title">{note.title || "Untitled Note"}</div>
          <div class="np-note-date">
            {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>

        <div
          class="mt-4 text-xs text-[var(--ui-text-muted)] space-y-1 border-t border-[var(--ui-border)] pt-3"
        >
          <div>Status: {networkStatus.isOnline ? "Online" : "Offline"}</div>
          {#if networkStatus.peerCount > 0}
            <div>{networkStatus.peerCount} person(s) editing</div>
          {:else}
            <div>Only you</div>
          {/if}
        </div>
      {/if}
    </div>
  </aside>

  <!-- Main Editor Area - Full Screen Glass Background -->
  <main class="np-main glass-editor-full">
    {#if isLoading}
      <div
        class="h-full flex items-center justify-center text-[var(--ui-text-muted)]"
      >
        Loading...
      </div>
    {:else if error}
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <p class="text-[var(--ui-error)] mb-4">{error}</p>
          <button class="np-btn np-btn-primary" onclick={() => goto("/app")}>
            Back to Notes
          </button>
        </div>
      </div>
    {:else if note && noteId && (!note.isProtected || hasRoomKey(noteId))}
      <div class="h-full flex flex-col glass-content">
        <!-- Top Menu Bar -->
        <div class="np-menu-bar">
          <div class="np-menu-group">
            <button class="np-menu-item" onclick={() => goto("/app")}
              >File</button
            >
            <div class="np-menu-dropdown">
              <button class="np-menu-dropdown-item" onclick={() => goto("/app")}
                >New Note</button
              >
              <button class="np-menu-dropdown-item" onclick={() => goto("/app")}
                >Open...</button
              >
              <div class="np-menu-separator"></div>
              <button
                class="np-menu-dropdown-item"
                onclick={() => (isExportModalOpen = true)}>Export...</button
              >
              <div class="np-menu-separator"></div>
              <button class="np-menu-dropdown-item" onclick={() => goto("/app")}
                >Close</button
              >
            </div>
          </div>

          <div class="np-menu-group">
            <button class="np-menu-item">Edit</button>
            <div class="np-menu-dropdown">
              <button
                class="np-menu-dropdown-item"
                onclick={() => editorInstance?.chain().focus().undo().run()}
                >Undo</button
              >
              <button
                class="np-menu-dropdown-item"
                onclick={() => editorInstance?.chain().focus().redo().run()}
                >Redo</button
              >
              <div class="np-menu-separator"></div>
              <button
                class="np-menu-dropdown-item"
                onclick={() =>
                  editorInstance?.chain().focus().selectAll().run()}
                >Select All</button
              >
            </div>
          </div>

          <div class="np-menu-group">
            <button class="np-menu-item">Share</button>
            <div class="np-menu-dropdown">
              <button
                class="np-menu-dropdown-item"
                onclick={() => (isShareModalOpen = true)}>Share Note...</button
              >
              <button
                class="np-menu-dropdown-item"
                onclick={() => (isProtectModalOpen = true)}
              >
                {note.isProtected ? "Change Password" : "Add Password"}
              </button>
            </div>
          </div>
        </div>

        <!-- Title Bar -->
        <div class="np-title-bar">
          <input
            type="text"
            value={note.title}
            onchange={(e) => handleTitleChange(e.currentTarget.value)}
            class="np-title-input"
            placeholder="Untitled Note"
          />
        </div>

        <!-- Formatting Toolbar -->
        <div class="np-toolbar">
          <div class="np-toolbar-group">
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('bold')
                ? 'np-btn-active'
                : ''}"
              onclick={() => editorInstance?.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"
                />
              </svg>
            </button>
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('italic')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M10 20l4-16m4 4l4 4M6 16l-4-4" />
              </svg>
            </button>
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('strike')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3M4 21h16" />
              </svg>
            </button>
          </div>

          <div class="np-toolbar-separator"></div>

          <div class="np-toolbar-group">
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('bulletList')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('orderedList')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" />
              </svg>
            </button>
          </div>

          <div class="np-toolbar-separator"></div>

          <div class="np-toolbar-group">
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('codeBlock')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <button
              class="np-btn np-btn-icon {editorInstance?.isActive('blockquote')
                ? 'np-btn-active'
                : ''}"
              onclick={() =>
                editorInstance?.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>
          </div>

          <div class="flex-1"></div>

          <!-- Voice Dictation Button -->
          <div class="np-toolbar-group">
            <button
              class="np-btn np-btn-icon {voice.status === 'listening'
                ? 'np-btn-active !bg-red-500 !border-red-500'
                : voice.status === 'ready'
                  ? 'np-btn-active !bg-green-500 !border-green-500'
                  : ''}"
              onclick={() => {
                if (voice.status === "idle" || voice.status === "error") {
                  voice.loadModel();
                } else if (voice.status === "ready") {
                  voice.startListening();
                } else if (voice.status === "listening") {
                  voice.stopListening();
                }
              }}
              disabled={voice.status === "loading" ||
                voice.status === "processing"}
              title="Voice Dictation"
            >
              {#if voice.status === "listening"}
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="7" width="10" height="10" rx="1" />
                </svg>
              {:else}
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              {/if}
            </button>
          </div>

          <div class="np-toolbar-group np-toolbar-actions">
            <button
              class="np-btn np-btn-sm glass-button"
              onclick={() => (isShareModalOpen = true)}
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
            <button
              class="np-btn np-btn-sm glass-button"
              onclick={() => (isExportModalOpen = true)}
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        <!-- Editor Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="np-editor-container">
            <Editor
              {noteId}
              user={currentUser}
              onEditorReady={handleEditorReady}
            />
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>

<!-- Modals -->
{#if note}
  <ShareModal
    bind:open={isShareModalOpen}
    baseUrl={isBrowser ? window.location.origin + window.location.pathname : ""}
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
    title={note.isProtected ? "Change Password" : "Add Password Protection"}
    type="dialog"
  >
    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        handleProtectNote();
      }}
    >
      <p class="text-sm text-[var(--ui-text-muted)]">
        Add a password to protect this note. The password is stored only on your
        device.
      </p>
      <div>
        <label class="np-label" for="protect-password">Password</label>
        <input
          id="protect-password"
          type="password"
          bind:value={protectPassword}
          class="np-input"
          placeholder="Enter password"
        />
      </div>
      <div>
        <label class="np-label" for="protect-confirm">Confirm Password</label>
        <input
          id="protect-confirm"
          type="password"
          bind:value={protectConfirmPassword}
          class="np-input"
          placeholder="Confirm password"
        />
      </div>
      {#if protectError}
        <div class="text-sm text-[var(--ui-error)]">{protectError}</div>
      {/if}
      <div class="flex gap-2 justify-end">
        <button
          type="button"
          class="np-btn"
          onclick={() => (isProtectModalOpen = false)}
        >
          Cancel
        </button>
        <button type="submit" class="np-btn np-btn-primary">
          {note.isProtected ? "Update Password" : "Add Password"}
        </button>
      </div>
    </form>
  </Modal>
{/if}

<!-- Password Prompt Modal -->
<Modal
  bind:open={showPasswordPrompt}
  title="Enter Password"
  closeOnBackdrop={false}
  closeOnEscape={false}
>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handlePasswordSubmit();
    }}
    class="space-y-4"
  >
    <p class="text-[var(--ui-text-muted)]">
      This note is password protected. Please enter the password to view it.
    </p>
    <label class="sr-only" for="password-attempt">Password</label>
    <input
      id="password-attempt"
      type="password"
      bind:value={passwordAttempt}
      class="np-input"
      placeholder="Enter password"
    />
    {#if passwordError}
      <div class="text-sm text-[var(--ui-error)]">{passwordError}</div>
    {/if}
    <div class="flex gap-2 justify-end">
      <button class="np-btn" onclick={() => goto("/app")}>Cancel</button>
      <button type="submit" class="np-btn np-btn-primary">Open Note</button>
    </div>
  </form>
</Modal>

<style>
  /* Menu Bar Styles */
  .np-menu-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: var(--ui-surface);
    border-bottom: 1px solid var(--ui-border);
  }

  .np-menu-group {
    position: relative;
  }

  .np-menu-item {
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ui-text);
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .np-menu-item:hover {
    background: var(--ui-bg);
  }

  .np-menu-group:hover .np-menu-dropdown {
    display: block;
  }

  .np-menu-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 180px;
    background: var(--ui-surface);
    border: 1px solid var(--ui-border);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    padding: 4px;
  }

  .np-menu-dropdown-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    color: var(--ui-text);
  }

  .np-menu-dropdown-item:hover {
    background: var(--ui-surface-elevated);
  }

  .np-menu-separator {
    height: 1px;
    background: var(--ui-border);
    margin: 4px 0;
  }

  /* Title Bar */
  .np-title-bar {
    padding: 16px 24px 8px;
    background: var(--ui-bg);
    border-bottom: 1px solid var(--ui-border);
  }

  .np-title-input {
    width: 100%;
    font-size: 28px;
    font-weight: 600;
    border: none;
    outline: none;
    background: transparent;
    color: var(--ui-text);
    padding: 0;
  }

  .np-title-input::placeholder {
    color: var(--ui-text-muted);
  }

  /* Toolbar Improvements */
  .np-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--ui-bg);
    border-bottom: 1px solid var(--ui-border);
  }

  .np-toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Full-screen glass editor background */
  .glass-editor-full {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.05) 0%,
      rgba(139, 92, 246, 0.05) 50%,
      rgba(6, 182, 212, 0.05) 100%
    );
    position: relative;
    overflow: hidden;
  }

  .glass-editor-full::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 20% 80%,
        rgba(99, 102, 241, 0.08) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(139, 92, 246, 0.08) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(6, 182, 212, 0.05) 0%,
        transparent 60%
      );
    pointer-events: none;
    z-index: 0;
  }

  .glass-editor-full::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .glass-content {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: none;
    border-radius: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    box-shadow: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :global(.dark) .glass-content {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Share/Export buttons with better spacing */
  .np-toolbar-actions {
    gap: 12px;
    margin-left: auto;
    padding-left: 16px;
    border-left: 1px solid var(--ui-border);
  }

  .np-toolbar-actions .np-btn {
    min-width: 90px;
    justify-content: center;
    padding: 6px 16px;
  }

  /* Glass button enhancement */
  .glass-button {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px) saturate(150%);
    -webkit-backdrop-filter: blur(12px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .glass-button:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .glass-button {
    background: rgba(51, 65, 85, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }

  :global(.dark) .glass-button:hover {
    background: rgba(71, 85, 105, 0.8);
  }

  /* Editor container fills available space */
  :global(.np-editor-container) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  :global(.np-editor-container > div) {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  :global(.ProseMirror) {
    flex: 1;
    min-height: calc(100vh - 200px);
    padding: 32px 48px;
    font-size: 16px;
    line-height: 1.7;
    width: 100%;
    max-width: none;
    outline: none;
  }

  /* Responsive adjustments for different screen sizes */
  @media (max-width: 1200px) {
    :global(.ProseMirror) {
      padding: 24px 32px;
    }
  }

  @media (max-width: 768px) {
    :global(.ProseMirror) {
      padding: 16px 20px;
      min-height: calc(100vh - 180px);
    }
  }

  @media (max-width: 480px) {
    :global(.ProseMirror) {
      padding: 12px 16px;
      font-size: 15px;
    }
  }
</style>

<!-- =========================================================================
NOTEPAD EDITOR PAGE
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

  $effect(() => {
    const currentId = page.params.id;
    if (currentId) {
      loadNoteData(currentId);

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
    } catch (err) {
      error = "Failed to load note.";
    } finally {
      isLoading = false;
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
  }
</script>

<div class="np-container">
  <!-- Sidebar -->
  <aside class="np-sidebar">
    <div class="np-sidebar-header">
      <button
        class="np-btn np-btn-icon"
        onclick={() => goto("/app")}
        title="Back to notes"
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

    <div class="flex-1 overflow-y-auto">
      {#if note}
        <div class="p-4 border-b border-[var(--np-border)]">
          <input
            type="text"
            value={note.title}
            onchange={(e) => handleTitleChange(e.currentTarget.value)}
            class="np-input font-semibold"
            placeholder="Note title"
          />
          <div class="mt-2 text-xs text-[var(--np-text-muted)]">
            Last edited {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>

        <div class="p-4 space-y-2">
          <button
            class="np-btn w-full justify-start"
            onclick={() => (isShareModalOpen = true)}
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Note
          </button>

          <button
            class="np-btn w-full justify-start"
            onclick={() => (isExportModalOpen = true)}
          >
            <svg
              class="w-4 h-4 mr-2"
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

          <button
            class="np-btn w-full justify-start"
            onclick={() => (isProtectModalOpen = true)}
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {note.isProtected ? "Change Password" : "Add Password"}
          </button>
        </div>

        <div class="p-4 border-t border-[var(--np-border)]">
          <div class="text-xs text-[var(--np-text-muted)] space-y-1">
            <div>Status: {networkStatus.isOnline ? "Online" : "Offline"}</div>
            {#if networkStatus.peerCount > 0}
              <div>{networkStatus.peerCount} person(s) editing</div>
            {:else}
              <div>Only you</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </aside>

  <!-- Main Editor -->
  <main class="np-main">
    {#if isLoading}
      <div
        class="h-full flex items-center justify-center text-[var(--np-text-muted)]"
      >
        Loading...
      </div>
    {:else if error}
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <p class="text-[var(--np-error)] mb-4">{error}</p>
          <button class="np-btn np-btn-primary" onclick={() => goto("/app")}>
            Back to Notes
          </button>
        </div>
      </div>
    {:else if note && noteId && (!note.isProtected || hasRoomKey(noteId))}
      <div class="h-full flex flex-col">
        <!-- Toolbar -->
        <div class="np-toolbar">
          <button
            class="np-btn np-btn-icon"
            onclick={() => editorInstance?.chain().focus().toggleBold().run()}
            title="Bold"
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
            class="np-btn np-btn-icon"
            onclick={() => editorInstance?.chain().focus().toggleItalic().run()}
            title="Italic"
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
            class="np-btn np-btn-icon"
            onclick={() => editorInstance?.chain().focus().toggleStrike().run()}
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
          <div class="np-toolbar-separator"></div>
          <button
            class="np-btn np-btn-icon"
            onclick={() =>
              editorInstance?.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M4 12h8M4 18V6M12 18V6M17 12h3m0 0v6m0-6l-4-4" />
            </svg>
          </button>
          <button
            class="np-btn np-btn-icon"
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
            class="np-btn np-btn-icon"
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
          <div class="np-toolbar-separator"></div>
          <button
            class="np-btn np-btn-icon"
            onclick={() =>
              editorInstance?.chain().focus().toggleCodeBlock().run()}
            title="Code"
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
            class="np-btn np-btn-icon"
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

<!-- Share Modal -->
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
      <p class="text-sm text-[var(--np-text-muted)]">
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
        <div class="text-sm text-[var(--np-error)]">{protectError}</div>
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
    <p class="text-[var(--np-text-muted)]">
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
      <div class="text-sm text-[var(--np-error)]">{passwordError}</div>
    {/if}
    <div class="flex gap-2 justify-end">
      <button class="np-btn" onclick={() => goto("/app")}> Cancel </button>
      <button type="submit" class="np-btn np-btn-primary"> Open Note </button>
    </div>
  </form>
</Modal>

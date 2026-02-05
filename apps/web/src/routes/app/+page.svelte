<!-- =========================================================================
APP DASHBOARD (+page.svelte for /app)
============================================================================ -->

<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth, ui } from "$stores";
  import {
    createNewNote,
    getUserNotes,
    deleteUserNote,
  } from "$lib/services/notes.svelte";
  import { Button, Modal, SearchBar, TagBadge } from "$components";
  import { TemplateModal } from "$lib/templates";
  import {
    searchNotes,
    getAllTags,
    semanticSearch,
  } from "$lib/services/search.svelte";
  import { getParam, setParam } from "$lib/utils/url-params.svelte";
  import { spatial } from "$lib/utils/spatial";
  import { fly, fade } from "svelte/transition";
  import type { Note } from "$db";

  // Local state
  let notes = $state<Note[]>([]);
  let isLoading = $state(true);
  let isCreating = $state(false);
  let noteToDelete = $state<Note | null>(null);
  let isDeleteModalOpen = $state(false);
  let isTemplateModalOpen = $state(false);

  // Search state
  let searchQuery = $state("");
  let selectedTag = $state<string | null>(null);
  let availableTags = $state<{ name: string; color: string }[]>([]);
  let semanticResults = $state<Note[] | null>(null);
  let isSearching = $state(false);

  // Instant Search via Svelte 5 Derived Rune
  let filteredNotes = $derived.by(() => {
    // If we have manual semantic results, prioritize them
    if (semanticResults !== null) return semanticResults;

    if (!searchQuery && !selectedTag) return notes;

    const queryLower = searchQuery.toLowerCase().trim();
    return notes.filter((note) => {
      const titleMatch =
        !queryLower || note.title.toLowerCase().includes(queryLower);
      const tagMatch = !selectedTag || note.tags.includes(selectedTag);
      return titleMatch && tagMatch;
    });
  });

  let hasActiveFilters = $derived(
    searchQuery.length > 0 || selectedTag !== null || semanticResults !== null,
  );

  // Keyboard shortcut handler
  function handleKeyDown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    if (cmdOrCtrl && event.key === "t" && !event.shiftKey) {
      if (isInsideInput(event.target)) return;
      event.preventDefault();
      handleCreateFromTemplate();
    }

    if (cmdOrCtrl && event.key === "n") {
      if (isInsideInput(event.target)) return;
      event.preventDefault();
      handleCreateNote();
    }

    if (
      (cmdOrCtrl &&
        (event.key.toLowerCase() === "f" || event.key.toLowerCase() === "k")) ||
      (event.key === "/" && !isInsideInput(event.target))
    ) {
      event.preventDefault();
      const searchInput = document.querySelector(
        'input[aria-label="Search notes"]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    if (event.key === "Escape" && hasActiveFilters) {
      handleClearFilters();
    }
  }

  function isInsideInput(target: any): boolean {
    const el = target as HTMLElement;
    return (
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable)
    );
  }

  function initSearchFromUrl() {
    searchQuery = getParam("search") || "";
    selectedTag = getParam("tag");
  }

  function updateUrlParams() {
    setParam("search", searchQuery || null);
    setParam("tag", selectedTag || null);
  }

  // Handle search input change (now instant via $derived)
  function handleSearch(query: string) {
    searchQuery = query;
    semanticResults = null; // Clear semantic results when typing a new search
    updateUrlParams();
  }

  async function handleSemanticSearch(query: string) {
    if (!query.trim()) return;

    try {
      isSearching = true;
      const results = await semanticSearch(query);
      semanticResults = results.map((r) => r.note);
      console.log(`[SemanticSearch] Found ${semanticResults.length} results`);
    } catch (err) {
      console.error("Semantic search failed:", err);
    } finally {
      isSearching = false;
    }
  }

  // Handle tag selection
  function handleTagSelect(tag: string | null) {
    selectedTag = tag;
    semanticResults = null; // Clear semantic results when filtering by tag
    updateUrlParams();
  }

  function handleClearFilters() {
    searchQuery = "";
    selectedTag = null;
    semanticResults = null;
    updateUrlParams();
  }

  onMount(() => {
    async function init() {
      await loadNotes();
      const tags = await getAllTags();
      availableTags = tags.map((tag, index) => ({
        name: tag,
        color: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
        ][index % 6],
      }));

      initSearchFromUrl();
    }

    init();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  async function loadNotes() {
    try {
      isLoading = true;
      notes = await getUserNotes();
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateNote() {
    try {
      isCreating = true;
      const newNote = await createNewNote("Untitled Note");
      goto(`/app/note/${newNote.id}`);
    } finally {
      isCreating = false;
    }
  }

  function handleCreateFromTemplate() {
    isTemplateModalOpen = true;
  }

  function openNote(noteId: string) {
    if ("startViewTransition" in document) {
      // @ts-ignore
      document.startViewTransition(() => goto(`/app/note/${noteId}`));
    } else {
      goto(`/app/note/${noteId}`);
    }
  }

  function confirmDelete(note: Note, event: MouseEvent) {
    event.stopPropagation();
    noteToDelete = note;
    isDeleteModalOpen = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    noteToDelete = null;
  }

  async function handleDelete() {
    if (!noteToDelete) return;
    try {
      const success = await deleteUserNote(noteToDelete.id);
      if (success) {
        notes = notes.filter((n) => n.id !== noteToDelete!.id);
      }
    } finally {
      noteToDelete = null;
      isDeleteModalOpen = false;
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Locanote</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-12 pb-32">
  <!-- 1. NEBULA GREETING (Zero UI Design) -->
  <header
    class="relative overflow-hidden p-8 sm:p-12 rounded-[2.5rem] glass-2 border-primary/20"
    in:fly={{ y: 20, duration: 800 }}
    use:spatial={{ intensity: 3, scale: 1.01 }}
  >
    <div class="relative z-10 space-y-4">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
      >
        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
        <span
          class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
          >System Online</span
        >
      </div>

      <h1
        class="text-4xl sm:text-6xl font-black text-[var(--ui-text)] tracking-tighter leading-none"
      >
        Welcome, <span class="text-primary text-shadow-glow"
          >{auth.session?.username}</span
        >
      </h1>

      <p
        class="text-[var(--ui-text-muted)] text-lg sm:text-xl font-medium max-w-xl"
      >
        Your private, peer-to-peer workspace is ready. {notes.length} thoughts captured
        securely.
      </p>

      <div class="flex flex-wrap gap-4 pt-4">
        <Button
          variant="primary"
          size="lg"
          onclick={handleCreateNote}
          loading={isCreating}
        >
          <svg
            class="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"><path d="M12 4v16m8-8H4" /></svg
          >
          Blank Portal
        </Button>
        <Button variant="glass" size="lg" onclick={handleCreateFromTemplate}>
          <svg
            class="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"><path d="M4 5h16M4 12h16M4 19h16" /></svg
          >
          Templates
        </Button>
      </div>
    </div>

    <!-- Background Decoration -->
    <div
      class="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"
    ></div>
  </header>

  <!-- 2. SEARCH & INTELLIGENCE -->
  <section class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 200 }}>
    <div class="glass-2 p-2 sm:p-4 rounded-3xl">
      <SearchBar
        bind:value={searchQuery}
        {availableTags}
        activeTag={selectedTag}
        onSearch={handleSearch}
        onSemanticSearch={handleSemanticSearch}
        onTagSelect={handleTagSelect}
        onClear={handleClearFilters}
        placeholder="Ask Semantic Scout or search notes..."
      />
    </div>
  </section>

  <!-- 3. PORTAL GRID -->
  <section class="space-y-8" in:fly={{ y: 20, duration: 800, delay: 400 }}>
    <div class="flex items-center justify-between px-2">
      <h2
        class="text-xs font-black uppercase tracking-[0.3em] text-[var(--ui-text-muted)]"
      >
        {hasActiveFilters ? "Scout Results" : "Recent Portals"}
      </h2>
      {#if hasActiveFilters}
        <button
          onclick={handleClearFilters}
          class="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >Reset</button
        >
      {/if}
    </div>

    {#if isLoading}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each Array(6) as _}
          <div
            class="h-48 rounded-[2rem] bg-[var(--ui-surface)] animate-pulse"
          ></div>
        {/each}
      </div>
    {:else if filteredNotes.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each filteredNotes as note (note.id)}
          <div
            class="glass-2 group relative p-8 cursor-pointer flex flex-col min-h-[220px] rounded-[2.5rem]"
            onclick={() => openNote(note.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === "Enter" && openNote(note.id)}
            style="view-transition-name: note-card-{note.id}"
            in:fade
            use:spatial={{ intensity: 8, scale: 1.03 }}
          >
            <!-- Specular Top Edge Handled by .glass-2 -->

            <button
              class="absolute top-6 right-6 p-2 text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all z-20
                     lg:opacity-0 lg:group-hover:opacity-100"
              onclick={(e) => confirmDelete(note, e)}
              aria-label="Delete note"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                ><path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                /></svg
              >
            </button>

            <div class="mb-4">
              {#if note.isProtected}
                <div class="text-primary mb-2" title="Encrypted">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="3"
                    ><path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    /></svg
                  >
                </div>
              {/if}
              <h3
                class="text-2xl font-black text-[var(--ui-text)] leading-tight group-hover:text-primary transition-colors"
                style="view-transition-name: note-title-{note.id}"
              >
                {note.title}
              </h3>
            </div>

            <div class="mt-auto space-y-4">
              <div class="flex flex-wrap gap-2">
                {#each note.tags.slice(0, 3) as tag}
                  <span
                    class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                {/each}
              </div>
              <div
                class="text-[10px] font-bold text-[var(--ui-text-muted)] uppercase tracking-tighter"
              >
                Synchronized {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="py-20 text-center glass-2 rounded-[3rem] border-dashed border-2"
      >
        <svg
          class="w-16 h-16 mx-auto mb-6 text-[var(--ui-text-muted)] opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          /></svg
        >
        <p class="text-xl font-bold text-[var(--ui-text-muted)]">
          No portals found in this sector.
        </p>
        <Button variant="ghost" onclick={handleClearFilters} class="mt-4"
          >Reset Frequencies</Button
        >
      </div>
    {/if}
  </section>
</div>

<!-- MODALS -->
<Modal
  bind:open={isDeleteModalOpen}
  title="Purge Portal?"
  type="sheet"
  onEnter={handleDelete}
>
  {#if noteToDelete}
    <div class="space-y-6 text-center">
      <p
        class="text-lg font-medium text-[var(--ui-text-muted)] leading-relaxed"
      >
        You are about to permanently purge <span
          class="text-[var(--ui-text)] font-black">"{noteToDelete.title}"</span
        > from your local neural vault. This cannot be undone.
      </p>
      <div class="flex gap-4">
        <Button variant="secondary" fullWidth onclick={closeDeleteModal}
          >Abort</Button
        >
        <Button variant="danger" fullWidth onclick={handleDelete}
          >Confirm Purge</Button
        >
      </div>
    </div>
  {/if}
</Modal>

<TemplateModal
  bind:open={isTemplateModalOpen}
  onCancel={() => (isTemplateModalOpen = false)}
/>

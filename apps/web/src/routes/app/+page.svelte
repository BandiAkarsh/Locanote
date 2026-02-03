<!-- =========================================================================
APP DASHBOARD (+page.svelte for /app)
============================================================================ -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, ui } from '$stores';
  import { createNewNote, getUserNotes, deleteUserNote } from '$lib/services/notes.svelte';
  import { Button, Modal, TemplateModal, SearchBar } from '$components';
  import { searchNotes, getAllTags } from '$lib/services/search.svelte';
  import { getParam, setParam } from '$lib/utils/url-params.svelte';
  import type { Note } from '$db';

  // Local state
  let notes = $state<Note[]>([]);
  let isLoading = $state(true);
  let isCreating = $state(false);
  let noteToDelete = $state<Note | null>(null);
  let isDeleteModalOpen = $state(false);
  let isTemplateModalOpen = $state(false);

  // Search state
  let searchQuery = $state('');
  let selectedTag = $state<string | null>(null);
  let availableTags = $state<{ name: string; color: string }[]>([]);
  let filteredNotes = $state<Note[]>([]);
  let isSearching = $state(false);
  let hasActiveFilters = $derived(searchQuery.length > 0 || selectedTag !== null);

  $effect(() => {
    isDeleteModalOpen = !!noteToDelete;
  });

  function closeDeleteModal() {
    noteToDelete = null;
  }

  // Keyboard shortcut handler
  function handleKeyDown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
    
    // Cmd/Ctrl + T: Open template modal
    if (cmdOrCtrl && event.key === 't' && !event.shiftKey) {
      if (isInsideInput(event.target)) return;
      event.preventDefault();
      handleCreateFromTemplate();
    }
    
    // Cmd/Ctrl + N: New note
    if (cmdOrCtrl && event.key === 'n') {
      if (isInsideInput(event.target)) return;
      event.preventDefault();
      handleCreateNote();
    }

    // Cmd/Ctrl + F, Cmd/Ctrl + K or /: Focus search
    if ((cmdOrCtrl && (event.key.toLowerCase() === 'f' || event.key.toLowerCase() === 'k')) || (event.key === '/' && !isInsideInput(event.target))) {
      event.preventDefault();
      console.log('[Shortcut] Focusing search');
      const searchInput = document.querySelector('input[aria-label="Search notes"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape: Clear filters
    if (event.key === 'Escape' && hasActiveFilters) {
      handleClearFilters();
    }
  }

  function isInsideInput(target: any): boolean {
    const el = target as HTMLElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  // Initialize search state from URL params
  function initSearchFromUrl() {
    const urlSearch = getParam('search', '');
    const urlTag = getParam('tag', '');
    
    if (urlSearch) {
      searchQuery = urlSearch;
    }
    if (urlTag) {
      selectedTag = urlTag;
    }
  }

  // Update URL when search changes
  function updateUrlParams() {
    if (searchQuery) {
      setParam('search', searchQuery);
    } else {
      setParam('search', null);
    }
    
    if (selectedTag) {
      setParam('tag', selectedTag);
    } else {
      setParam('tag', null);
    }
  }

  // Execute search
  async function executeSearch() {
    if (!hasActiveFilters) {
      filteredNotes = notes;
      return;
    }
    
    isSearching = true;
    try {
      const results = await searchNotes({
        query: searchQuery,
        tags: selectedTag ? [selectedTag] : undefined
      });
      filteredNotes = results.map(r => r.note);
    } catch (error) {
      console.error('Search failed:', error);
      filteredNotes = notes;
    } finally {
      isSearching = false;
    }
  }

  // Handle search input change
  function handleSearch(query: string) {
    searchQuery = query;
    updateUrlParams();
    executeSearch();
  }

  // Handle tag selection
  function handleTagSelect(tag: string | null) {
    selectedTag = tag;
    updateUrlParams();
    executeSearch();
  }

  // Clear all filters
  function handleClearFilters() {
    searchQuery = '';
    selectedTag = null;
    setParam('search', null);
    setParam('tag', null);
    filteredNotes = notes;
  }

  // Load notes on mount
  onMount(async () => {
    await loadNotes();
    
    // Load available tags for the search bar
    const tags = await getAllTags();
    availableTags = tags.map((tag, index) => ({
      name: tag,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]
    }));
    
    // Initialize search from URL params
    initSearchFromUrl();
    
    // Execute search if filters are active
    if (hasActiveFilters) {
      await executeSearch();
    } else {
      filteredNotes = notes;
    }
    
    // Add keyboard shortcut listener
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Load user's notes
  async function loadNotes() {
    try {
      isLoading = true;
      notes = await getUserNotes();
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      isLoading = false;
    }
  }

  // Create a new note
  async function handleCreateNote() {
    try {
      isCreating = true;
      const newNote = await createNewNote('Untitled Note');
      notes = [newNote, ...notes];
      goto(`/app/note/${newNote.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      isCreating = false;
    }
  }

  function handleCreateFromTemplate() {
    isTemplateModalOpen = true;
  }

  function handleTemplateSelected() {
    // Refresh notes list after template note created
    loadNotes();
  }

  function openNote(noteId: string) {
    goto(`/app/note/${noteId}`);
  }

  function confirmDelete(note: Note, event: Event) {
    event.stopPropagation();
    noteToDelete = note;
  }

  async function handleDelete() {
    if (!noteToDelete) return;
    try {
      await deleteUserNote(noteToDelete.id);
      notes = notes.filter(n => n.id !== noteToDelete!.id);
      noteToDelete = null;
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Dashboard - Locanote</title>
</svelte:head>

<div class="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pb-24 sm:pb-10">
  <!-- Welcome Section -->
  <div class="themed-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span class="text-xs font-bold uppercase tracking-widest text-[var(--ui-text-muted)]">Dashboard</span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--ui-text)] tracking-tight mb-2">
          Welcome back{auth.session?.username ? `, ${auth.session.username}` : ''}
        </h1>
        <p class="text-sm text-[var(--ui-text-muted)] max-w-lg">
          {#if hasActiveFilters}
            Showing {filteredNotes.length} result{filteredNotes.length === 1 ? '' : 's'} for your search
          {:else}
            {notes.length === 0 ? 'Start capturing your thoughts securely.' : `You have ${notes.length} note${notes.length === 1 ? '' : 's'} ready to explore.`}
          {/if}
        </p>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-3 lg:flex-nowrap">
        <button 
          onclick={handleCreateNote}
          disabled={isCreating}
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isCreating}
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          {:else}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          {/if}
          <span class="hidden sm:inline">New Note</span>
          <span class="sm:hidden">New</span>
        </button>
        
        <button 
          onclick={handleCreateFromTemplate}
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--ui-surface-elevated)] text-[var(--ui-text)] text-sm font-semibold rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-surface-hover)] active:scale-95 transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span class="hidden sm:inline">Template</span>
          <span class="sm:hidden">Tpl</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="themed-card p-4 sm:p-6">
    <SearchBar
      bind:value={searchQuery}
      availableTags={availableTags}
      activeTag={selectedTag}
      onSearch={handleSearch}
      onTagSelect={handleTagSelect}
      onClear={handleClearFilters}
      placeholder="Search your notes..."
    />
  </div>

  <!-- Quick Stats Grid -->
  {#if !ui.cleanMode}
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="themed-card p-4 sm:p-6 flex flex-col items-center justify-center text-center">
        <div class="text-2xl sm:text-4xl font-black text-primary mb-1">
          {hasActiveFilters ? filteredNotes.length : notes.length}
        </div>
        <div class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)]">
          {hasActiveFilters ? 'Results' : 'Notes'}
        </div>
      </div>
      
      <button 
        onclick={() => goto('/app/settings')}
        class="themed-card p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform"
      >
        <div class="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-2">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)]">Settings</div>
      </button>

      <!-- Storage Info -->
      <div class="themed-card p-4 sm:p-6 flex flex-col items-center justify-center text-center">
        <div class="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-2">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--ui-text-muted)]">Encrypted</div>
      </div>
    </div>
  {/if}

  <!-- Notes List Header -->
  <div class="flex items-center justify-between px-2">
    <h2 class="text-xl sm:text-2xl font-black text-[var(--ui-text)] tracking-tighter uppercase">
      {#if hasActiveFilters}
        Search Results ({filteredNotes.length})
      {:else}
        Recent Notes
      {/if}
    </h2>
    <div class="h-0.5 flex-1 mx-4 bg-[var(--ui-border)] opacity-30 hidden sm:block"></div>
    {#if hasActiveFilters}
      <button
        onclick={handleClearFilters}
        class="ml-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear filters
      </button>
    {/if}
  </div>

  {#if isLoading || isSearching}
    <div class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  {:else if notes.length === 0}
    <div class="text-center py-16 themed-card border-dashed">
      <h3 class="text-lg font-bold text-[var(--ui-text)] mb-2">No notes yet</h3>
      <p class="text-sm text-[var(--ui-text-muted)] mb-6">Capture your thoughts, they are encrypted and safe.</p>
      <Button onclick={handleCreateNote} loading={isCreating}>Start your first note</Button>
    </div>
  {:else if filteredNotes.length === 0 && hasActiveFilters}
    <!-- No search results state -->
    <div class="text-center py-16 themed-card border-dashed">
      <div class="w-16 h-16 mx-auto mb-4 text-[var(--ui-text-muted)] opacity-50">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-[var(--ui-text)] mb-2">No results found</h3>
      <p class="text-sm text-[var(--ui-text-muted)] mb-6">
        No notes match "{searchQuery}"{selectedTag ? ` with tag "${selectedTag}"` : ''}
      </p>
      <Button variant="secondary" onclick={handleClearFilters}>Clear filters</Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {#each filteredNotes as note (note.id)}
        <div 
          class="themed-card group relative p-5 sm:p-6 hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col min-h-[140px]"
          onclick={() => openNote(note.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && openNote(note.id)}
        >
          <!-- Delete Icon - Persistent on mobile, hover on desktop -->
          <button 
            class="absolute top-3 right-3 p-2 text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all z-20 
                   lg:opacity-0 lg:group-hover:opacity-100"
            onclick={(e) => confirmDelete(note, e)}
            aria-label="Delete note"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <!-- Security Badge if protected -->
          {#if note.isProtected}
            <div class="absolute top-4 left-4" title="Password Protected">
              <svg class="w-3 h-3 text-primary opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          {/if}

          <h3 class="text-lg font-black text-[var(--ui-text)] mb-2 pr-8 truncate group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          
          <div class="mt-auto flex items-center justify-between pt-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-[var(--ui-text-muted)]">
              {formatDate(note.updatedAt)}
            </span>
            
            <div class="flex gap-1">
              {#each note.tags.slice(0, 2) as tag}
                <div class="w-2 h-2 rounded-full bg-primary/30"></div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Mobile Floating Action Buttons -->
<div class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
  <button 
    onclick={handleCreateNote}
    disabled={isCreating}
    class="bg-primary text-white h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all font-black uppercase tracking-widest glow-border"
  >
    {#if isCreating}
      <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    {:else}
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    {/if}
    New
  </button>
  <button 
    onclick={handleCreateFromTemplate}
    class="bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)] h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all font-black uppercase tracking-widest"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
    Template
  </button>
</div>

<Modal
  bind:open={isDeleteModalOpen}
  title="Delete Note?"
  onEnter={handleDelete}
>
  {#if noteToDelete}
    <div class="space-y-6">
      <div class="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
        <p class="text-[var(--ui-text)] font-bold mb-1">Permanently delete note?</p>
        <p class="text-xs text-[var(--ui-text-muted)]">"{noteToDelete.title}"</p>
      </div>
      <div class="flex gap-3">
        <Button variant="ghost" fullWidth onclick={closeDeleteModal}>Keep it</Button>
        <Button variant="danger" fullWidth onclick={handleDelete}>Delete Forever</Button>
      </div>
    </div>
  {/if}
</Modal>

<TemplateModal
  bind:open={isTemplateModalOpen}
  onSelect={handleTemplateSelected}
  onCancel={() => isTemplateModalOpen = false}
/>

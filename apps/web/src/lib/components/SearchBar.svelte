<!-- =========================================================================
SEARCH BAR COMPONENT (SearchBar.svelte)
============================================================================
A full-width search input with debounced search, clear button, and tag filters.

USAGE:
<SearchBar
  bind:value={searchQuery}
  availableTags={tags}
  activeTag={selectedTag}
  onSearch={(query) => handleSearch(query)}
  onTagSelect={(tag) => handleTagSelect(tag)}
  onClear={() => handleClear()}
/>

PROPS:
- value: string (bindable) - Current search query
- availableTags: Array<{name: string, color: string}> - Tags for filter chips
- activeTag: string | null - Currently selected tag
- placeholder: string - Placeholder text (default: "Search notes...")
- debounceMs: number - Debounce delay in ms (default: 300)

EVENTS:
- onSearch: (query: string) => void - Emitted on debounced search
- onTagSelect: (tag: string | null) => void - Emitted when tag chip clicked
- onClear: () => void - Emitted when clear button clicked
========================================================================== -->

<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import TagBadge from './TagBadge.svelte';

  interface Tag {
    name: string;
    color: string;
  }

  interface Props {
    value?: string;
    availableTags?: Tag[];
    activeTag?: string | null;
    placeholder?: string;
    debounceMs?: number;
    onSearch?: (query: string) => void;
    onSemanticSearch?: (query: string) => void;
    onTagSelect?: (tag: string | null) => void;
    onClear?: () => void;
  }

  let {
    value = $bindable(''),
    availableTags = [],
    activeTag = null,
    placeholder = 'Search notes...',
    debounceMs = 300,
    onSearch,
    onSemanticSearch,
    onTagSelect,
    onClear
  }: Props = $props();

  // Internal state
  let inputRef: HTMLInputElement | null = $state(null);
  let debounceTimer: ReturnType<typeof setTimeout> | null = $state(null);
  let isFocused = $state(false);

  // Derived state
  let hasContent = $derived(value.length > 0);
  let hasActiveFilters = $derived(hasContent || activeTag !== null);

  // Debounced search handler
  function debouncedSearch(query: string) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);
  }

  // Handle input changes
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    debouncedSearch(value);
  }

  // Clear search and filters
  function handleClear() {
    value = '';
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch?.('');
    onClear?.();
    inputRef?.focus();
  }

  // Handle tag selection
  function handleTagClick(tagName: string) {
    const newTag = activeTag === tagName ? null : tagName;
    onTagSelect?.(newTag);
  }

  // Remove active tag filter
  function removeActiveTag() {
    onTagSelect?.(null);
  }

  // Focus management
  function handleFocus() {
    isFocused = true;
  }

  function handleBlur() {
    isFocused = false;
  }

  // Keyboard shortcut: Cmd/Ctrl + K to focus
  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inputRef?.focus();
    }
    if (e.key === 'Escape' && hasActiveFilters) {
      handleClear();
    }
  }

  onMount(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  });
</script>

<div class="w-full">
  <!-- Search Input Container -->
  <div
    class="
      relative flex items-center w-full
      rounded-[var(--ui-radius)] border
      bg-[var(--ui-surface)] border-[var(--ui-border)]
      backdrop-blur-[var(--ui-blur)]
      transition-all duration-300
      {isFocused ? 'ring-2 ring-primary/20 border-primary' : ''}
    "
  >
    <!-- Search Icon -->
    <div class="absolute left-4 text-[var(--ui-text-muted)] pointer-events-none">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Input Field -->
    <input
      bind:this={inputRef}
      type="text"
      {value}
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      {placeholder}
      class="
        w-full pl-12 pr-24
        bg-transparent border-none
        text-[var(--ui-text)] placeholder-[var(--ui-text-muted)]
        focus:outline-none
        text-base sm:text-lg py-3.5
      "
      aria-label="Search notes"
      autocomplete="off"
    />

    <!-- Action Group (Scout + Clear) -->
    <div class="absolute right-3 flex items-center gap-1">
      <!-- Semantic Scout Symbol -->
      <button
        type="button"
        onclick={() => onSemanticSearch?.(value)}
        class="p-2 rounded-xl text-primary hover:bg-primary/10 transition-all group/scout"
        title="AI Semantic Scout"
      >
        <svg class="w-5 h-5 group-hover/scout:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {#if hasContent}
        <button
          type="button"
          onclick={handleClear}
          class="
            p-1.5 rounded-full
            text-[var(--ui-text-muted)]
            hover:bg-[var(--ui-border)] hover:text-[var(--ui-text)]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/20
          "
          aria-label="Clear search"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Active Filters Row -->
  {#if hasActiveFilters}
    <div class="flex flex-wrap items-center gap-2 mt-3">
      <span class="text-sm text-[var(--ui-text-muted)]">Filters:</span>
      
      {#if hasContent}
        <div
          class="
            inline-flex items-center gap-1.5 px-2.5 py-1
            rounded-full text-sm font-medium
            bg-primary/10 text-primary border border-primary/20
          "
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="max-w-[150px] truncate">"{value}"</span>
          <button
            type="button"
            onclick={handleClear}
            class="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
            aria-label="Remove search filter"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/if}

      {#if activeTag}
        {@const tag = availableTags.find(t => t.name === activeTag)}
        {#if tag}
          <TagBadge
            name={tag.name}
            color={tag.color}
            removable={true}
            onRemove={removeActiveTag}
          />
        {/if}
      {/if}

      <Button
        variant="ghost"
        size="sm"
        onclick={handleClear}
        class="text-xs"
      >
        Clear all
      </Button>
    </div>
  {/if}

  <!-- Tag Filter Chips -->
  {#if availableTags.length > 0}
    <div class="flex flex-wrap items-center gap-2 mt-3">
      <span class="text-sm text-[var(--ui-text-muted)]">Tags:</span>
      {#each availableTags as tag (tag.name)}
        <button
          type="button"
          onclick={() => handleTagClick(tag.name)}
          class="
            inline-flex items-center gap-1.5 px-2.5 py-1
            rounded-full text-sm font-medium
            transition-all duration-200
            {activeTag === tag.name
              ? 'bg-primary text-white shadow-md'
              : 'bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)] hover:bg-[var(--ui-border)]'
            }
          "
        >
          <span
            class="w-2 h-2 rounded-full"
            style="background-color: {tag.color};"
          ></span>
          <span>{tag.name}</span>
          {#if activeTag === tag.name}
            <svg class="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

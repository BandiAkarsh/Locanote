<!-- =========================================================================
TEMPLATE MODAL COMPONENT (TemplateModal.svelte)
============================================================================ -->

<script lang="ts">
  import { Modal, Button, Input } from "$components";
  import {
    getAllTemplates,
    getTemplateCategories,
    filterTemplates,
    createNoteFromTemplate,
  } from "$lib/templates/TemplateService.svelte";
  import type {
    NoteTemplate,
    TemplateCategory,
    TemplateFilter,
  } from "$lib/templates/types";
  import { goto } from "$app/navigation";

  // Props
  let {
    open = $bindable(false),
    onSelect,
    onCancel,
  }: {
    open?: boolean;
    onSelect?: (template: NoteTemplate, noteId: string) => void;
    onCancel?: () => void;
  } = $props();

  // State
  let templates = $state<NoteTemplate[]>(getAllTemplates());
  let categories = $state(getTemplateCategories());
  let activeCategory = $state<TemplateCategory>("all");
  let searchQuery = $state("");
  let isCreating = $state(false);
  let selectedTemplate = $state<NoteTemplate | null>(null);
  let customTitle = $state("");
  let showTitleInput = $state(false);

  // Filter templates based on category and search
  let filteredTemplates = $derived.by(() => {
    const filter: TemplateFilter = {
      category: activeCategory,
      search: searchQuery,
    };
    return filterTemplates(templates, filter);
  });

  // Icon mapping for Lucide icons
  const iconMap: Record<string, string> = {
    users:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    "book-open":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    target:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    utensils:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    calendar:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    "book-marked":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>',
    "file-text":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  };

  function getIconSvg(iconName: string): string {
    return iconMap[iconName] || iconMap["file-text"];
  }

  function handleCategoryChange(category: TemplateCategory) {
    activeCategory = category;
  }

  function handleSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
  }

  function handleTemplateSelect(template: NoteTemplate) {
    selectedTemplate = template;
    customTitle = template.defaultTitle;
    showTitleInput = true;
  }

  async function handleCreateNote() {
    if (!selectedTemplate || isCreating) return;

    isCreating = true;
    try {
      const result = await createNoteFromTemplate(
        selectedTemplate.id,
        customTitle,
      );
      if (result.note) {
        // Store template content in sessionStorage so the note page can use it
        if (result.templateContent) {
          sessionStorage.setItem(
            `template-content-${result.note.id}`,
            JSON.stringify(result.templateContent),
          );
        }

        // Navigate to the new note
        goto(`/app/note/${result.note.id}`);

        // Notify parent with template info and noteId
        onSelect?.(selectedTemplate, result.note.id);

        // Reset state
        open = false;
        showTitleInput = false;
        selectedTemplate = null;
        customTitle = "";
      }
    } catch (error) {
      console.error("[TemplateModal] Failed to create note:", error);
    } finally {
      isCreating = false;
    }
  }

  function handleCancel() {
    open = false;
    showTitleInput = false;
    selectedTemplate = null;
    customTitle = "";
    onCancel?.();
  }

  function handleBackToTemplates() {
    showTitleInput = false;
    selectedTemplate = null;
  }
</script>

<Modal
  bind:open
  title={showTitleInput ? "Create Note" : "Choose a Template"}
  closeOnBackdrop={!isCreating}
  closeOnEscape={!isCreating}
  onEnter={showTitleInput ? handleCreateNote : undefined}
>
  {#if showTitleInput && selectedTemplate}
    <!-- Title Input View -->
    <div class="space-y-4 sm:space-y-5">
      <div
        class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--ui-bg)] rounded-lg"
      >
        <div
          class="w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style="background-color: {selectedTemplate.color}20; color: {selectedTemplate.color};"
        >
          {@html getIconSvg(selectedTemplate.icon)}
        </div>
        <div class="min-w-0">
          <p class="font-medium text-[var(--ui-text)] text-base sm:text-sm">
            {selectedTemplate.name}
          </p>
          <p class="text-sm sm:text-xs text-[var(--ui-text-muted)]">
            {selectedTemplate.description}
          </p>
        </div>
      </div>

      <Input
        label="Note Title"
        placeholder={selectedTemplate.defaultTitle}
        bind:value={customTitle}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            handleCreateNote();
          }
        }}
        autofocus
        class="w-full"
      />

      <div class="flex gap-3 pt-2 sm:pt-4">
        <Button
          variant="ghost"
          onclick={handleBackToTemplates}
          disabled={isCreating}
          class="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
        >
          Back
        </Button>
        <Button
          variant="primary"
          onclick={handleCreateNote}
          disabled={isCreating || !customTitle.trim()}
          class="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
        >
          {#if isCreating}
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating...
          {:else}
            Create Note
          {/if}
        </Button>
      </div>
    </div>
  {:else}
    <!-- Template Selection View -->
    <div class="space-y-4 sm:space-y-6">
      <!-- Search -->
      <Input
        placeholder="Search templates..."
        oninput={handleSearchChange}
        value={searchQuery}
        class="w-full"
      >
        {#snippet icon()}
          <svg
            class="w-5 h-5 text-[var(--ui-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        {/snippet}
      </Input>

      <!-- Categories - Scrollable on mobile -->
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {#each categories as category}
          <button
            type="button"
            class="
							px-4 py-2 sm:px-3 sm:py-1.5 rounded-full text-sm font-medium whitespace-nowrap
							min-h-[44px] sm:min-h-0
							transition-all duration-200
							{activeCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] border border-[var(--ui-border)]'}
						"
            onclick={() => handleCategoryChange(category.id)}
          >
            {category.name} ({category.count})
          </button>
        {/each}
      </div>

      <!-- Templates Grid - 1 col mobile, 2 cols desktop -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1 -mx-1"
      >
        {#each filteredTemplates as template}
          <button
            type="button"
            class="
							text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200
							min-h-[88px] sm:min-h-0
							bg-[var(--ui-surface)] border-[var(--ui-border)]
							hover:border-[{template.color}] hover:shadow-lg
							focus:outline-none focus:ring-2 focus:ring-[{template.color}]
							active:scale-[0.98]
						"
            style="--tw-border-opacity: 0.3;"
            onclick={() => handleTemplateSelect(template)}
            onmouseenter={(e) =>
              (e.currentTarget.style.borderColor = template.color)}
            onmouseleave={(e) =>
              (e.currentTarget.style.borderColor = "var(--ui-border)")}
          >
            <div class="flex items-start gap-3 sm:gap-4">
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background-color: {template.color}20; color: {template.color};"
              >
                {@html getIconSvg(template.icon)}
              </div>
              <div class="flex-1 min-w-0 py-1">
                <h3
                  class="font-semibold text-[var(--ui-text)] text-base sm:text-sm truncate"
                >
                  {template.name}
                </h3>
                <p
                  class="text-sm sm:text-xs text-[var(--ui-text-muted)] line-clamp-2 mt-1 sm:mt-0.5"
                >
                  {template.description}
                </p>
                <div class="flex gap-1.5 mt-2 sm:mt-1.5">
                  {#each template.defaultTags.slice(0, 2) as tag}
                    <span
                      class="px-2.5 py-1 sm:px-2 sm:py-0.5 text-xs rounded-full bg-[var(--ui-bg)] text-[var(--ui-text-muted)]"
                    >
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>

      {#if filteredTemplates.length === 0}
        <div class="text-center py-8 text-[var(--ui-text-muted)]">
          <svg
            class="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No templates found</p>
          <p class="text-sm mt-1">Try a different search or category</p>
        </div>
      {/if}

      <!-- Cancel Button -->
      <div class="flex justify-end pt-2 sm:pt-4">
        <Button
          variant="ghost"
          onclick={handleCancel}
          class="min-h-[44px] sm:min-h-0"
        >
          Cancel
        </Button>
      </div>
    </div>
  {/if}
</Modal>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

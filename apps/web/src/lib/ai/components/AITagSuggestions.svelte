<!--
  AITagSuggestions.svelte
  
  Inline tag suggestions with confidence indicators
  Progressive disclosure: appears when AI suggests relevant tags
-->
<script lang="ts">
  import type { TagSuggestion } from "$ai/types.js";
  import {
    getConfidenceColor,
    formatConfidenceDots,
    getConfidenceLabel,
  } from "$ai/components.js";
  import { Sparkles, X, Check, Plus } from "lucide-svelte";

  interface Props {
    suggestions: TagSuggestion[];
    existingTags: string[];
    onAccept: (tag: string) => void;
    onDismiss: (tag: string) => void;
    isLoading?: boolean;
  }

  let {
    suggestions,
    existingTags,
    onAccept,
    onDismiss,
    isLoading = false,
  }: Props = $props();

  let expanded = $state(false);
  let dismissedTags = $state<Set<string>>(new Set());

  let visibleSuggestions = $derived(
    suggestions
      .filter((s) => !dismissedTags.has(s.tag))
      .filter((s) => !existingTags.includes(s.tag))
      .slice(0, expanded ? undefined : 3),
  );

  let hasMore = $derived(suggestions.length > 3 && !expanded);

  function handleAccept(tag: string) {
    dismissedTags.add(tag);
    onAccept(tag);
  }

  function handleDismiss(tag: string, event: Event) {
    event.stopPropagation();
    dismissedTags.add(tag);
    onDismiss(tag);
  }

  function toggleExpanded() {
    expanded = !expanded;
  }
</script>

{#if isLoading}
  <div class="ai-suggestions-loading">
    <Sparkles size={14} class="animate-pulse" />
    <span class="text-sm text-[var(--ui-text-muted)]">Analyzing content...</span
    >
  </div>
{:else if visibleSuggestions.length > 0}
  <div class="ai-suggestions" role="region" aria-label="AI tag suggestions">
    <div class="ai-suggestions-header">
      <Sparkles size={14} class="text-[var(--ui-accent)]" />
      <span class="text-xs font-medium text-[var(--ui-text-muted)]">
        AI Suggested Tags
      </span>
    </div>

    <div class="suggestion-tags">
      {#each visibleSuggestions as suggestion (suggestion.tag)}
        <div
          class="suggestion-tag"
          class:new={suggestion.isNew}
          style="--confidence-color: {getConfidenceColor(
            suggestion.confidence,
          )}"
          title="{suggestion.reason} (Confidence: {getConfidenceLabel(
            suggestion.confidence,
          )})"
        >
          <button
            class="tag-content"
            onclick={() => handleAccept(suggestion.tag)}
            type="button"
          >
            {#if suggestion.isNew}
              <Plus size={10} />
            {/if}
            <span class="tag-name">{suggestion.tag}</span>
            <span class="confidence-indicator" aria-hidden="true">
              {formatConfidenceDots(suggestion.confidence)}
            </span>
          </button>
          <button
            class="dismiss-btn"
            onclick={(e) => handleDismiss(suggestion.tag, e)}
            aria-label="Dismiss suggestion"
            type="button"
          >
            <X size={10} />
          </button>
        </div>
      {/each}

      {#if hasMore}
        <button class="show-more-btn" onclick={toggleExpanded} type="button">
          +{suggestions.length - 3} more
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ai-suggestions-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .ai-suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--ui-surface-elevated);
    border: 1px solid var(--ui-border);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
  }

  .ai-suggestions-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .suggestion-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .suggestion-tag {
    display: flex;
    align-items: center;
    background: var(--ui-surface);
    border: 1px solid var(--confidence-color, var(--ui-border));
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .suggestion-tag:hover {
    background: var(--ui-surface-hover);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .suggestion-tag.new {
    background: rgba(var(--ui-accent-rgb), 0.1);
  }

  .tag-content {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--ui-text);
  }

  .tag-name {
    font-weight: 500;
  }

  .confidence-indicator {
    font-size: 0.5rem;
    color: var(--confidence-color);
    letter-spacing: -1px;
  }

  .dismiss-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: none;
    border: none;
    border-left: 1px solid var(--ui-border);
    cursor: pointer;
    color: var(--ui-text-muted);
    transition: color 0.15s ease;
  }

  .dismiss-btn:hover {
    color: var(--ui-error);
    background: rgba(var(--ui-error-rgb), 0.1);
  }

  .show-more-btn {
    padding: 0.25rem 0.5rem;
    background: none;
    border: 1px dashed var(--ui-border);
    border-radius: 1rem;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--ui-text-muted);
    transition: all 0.15s ease;
  }

  .show-more-btn:hover {
    border-color: var(--ui-accent);
    color: var(--ui-accent);
  }
</style>

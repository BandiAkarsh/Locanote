<!-- =========================================================================
EXPORT MODAL COMPONENT
============================================================================ -->

<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/Button.svelte";
  import {
    exportNote,
    downloadExport,
    getMimeType,
    getFileExtension,
    type ExportFormat,
  } from "$lib/services/export.svelte";
  import type { JSONContent } from "@tiptap/core";

  // ==========================================================================
  // PROPS
  // ==========================================================================
  type Props = {
    open?: boolean;
    noteTitle: string;
    noteContent: JSONContent;
  };

  let { open = $bindable(false), noteTitle, noteContent }: Props = $props();

  // ==========================================================================
  // STATE
  // ==========================================================================
  let selectedFormat: ExportFormat = $state("markdown");
  let previewContent: string = $state("");
  let isLoading: boolean = $state(false);
  let error: string | null = $state(null);

  // ==========================================================================
  // FORMAT OPTIONS
  // ==========================================================================
  const formatOptions: { value: ExportFormat; label: string; icon: string }[] =
    [
      {
        value: "markdown",
        label: "Markdown",
        icon: "M",
      },
      {
        value: "html",
        label: "HTML",
        icon: "H",
      },
      {
        value: "pdf",
        label: "PDF",
        icon: "P",
      },
    ];

  // ==========================================================================
  // PREVIEW GENERATION
  // ==========================================================================
  async function updatePreview() {
    if (selectedFormat === "pdf") {
      previewContent = "";
      return;
    }

    isLoading = true;
    error = null;

    try {
      const result = await exportNote(noteContent, {
        format: selectedFormat,
        includeTitle: true,
        title: noteTitle,
        filename: noteTitle,
      });

      if (typeof result === "string") {
        previewContent = result;
      } else {
        previewContent = "[Binary content - preview not available]";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to generate preview";
      previewContent = "";
    } finally {
      isLoading = false;
    }
  }

  // ==========================================================================
  // DOWNLOAD HANDLER
  // ==========================================================================
  async function handleDownload(format: ExportFormat) {
    isLoading = true;
    error = null;

    try {
      const result = await exportNote(noteContent, {
        format,
        includeTitle: true,
        title: noteTitle,
        filename: noteTitle,
      });

      const filename = `${noteTitle || "note"}.${getFileExtension(format)}`;
      const mimeType = getMimeType(format);

      downloadExport(result, filename, mimeType);
    } catch (err) {
      error =
        err instanceof Error
          ? err.message
          : `Failed to export as ${format.toUpperCase()}`;
    } finally {
      isLoading = false;
    }
  }

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  $effect(() => {
    if (open && noteContent) {
      updatePreview();
    }
  });

  $effect(() => {
    if (selectedFormat) {
      updatePreview();
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  function getPreviewTitle(): string {
    return selectedFormat === "markdown"
      ? "Markdown Preview"
      : selectedFormat === "html"
        ? "HTML Preview"
        : "PDF Export";
  }

  function getPreviewDescription(): string {
    return selectedFormat === "markdown"
      ? "Preview of the Markdown export. You can download the file below."
      : selectedFormat === "html"
        ? "Preview of the HTML export. You can download the file below."
        : "PDF will be generated and downloaded. No preview available.";
  }
</script>

<Modal
  bind:open
  title="Export Note"
  size="large"
  closeOnBackdrop={true}
  closeOnEscape={true}
  onEnter={() => handleDownload(selectedFormat)}
>
  <div class="export-modal">
    <!-- Format Selection -->
    <div class="format-section">
      <h3 class="section-title">Select Format</h3>
      <div class="format-options">
        {#each formatOptions as option}
          <button
            type="button"
            class="format-option"
            class:selected={selectedFormat === option.value}
            onclick={() => (selectedFormat = option.value)}
            aria-pressed={selectedFormat === option.value}
          >
            <span class="format-icon">{option.icon}</span>
            <span class="format-label">{option.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Preview Section -->
    <div class="preview-section">
      <div class="preview-header">
        <h3 class="preview-title">{getPreviewTitle()}</h3>
        <p class="preview-description">{getPreviewDescription()}</p>
      </div>

      {#if isLoading}
        <div class="loading-state">
          <svg class="loading-spinner" viewBox="0 0 24 24" fill="none">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Generating {selectedFormat.toUpperCase()}...</span>
        </div>
      {:else if error}
        <div class="error-state">
          <svg
            class="error-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      {:else if selectedFormat === "pdf"}
        <div class="pdf-placeholder">
          <svg
            class="pdf-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p>PDF file ready for download</p>
          <span class="pdf-note">Note: PDF generation may take a moment</span>
        </div>
      {:else if previewContent}
        <div class="preview-content">
          <pre class="preview-code">{previewContent}</pre>
        </div>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="action-section">
      <Button
        variant="secondary"
        onclick={() => (open = false)}
        disabled={isLoading}
      >
        Cancel
      </Button>

      <div class="download-buttons">
        {#each formatOptions as option}
          <Button
            variant={selectedFormat === option.value ? "primary" : "ghost"}
            size="sm"
            loading={isLoading && selectedFormat === option.value}
            onclick={() => handleDownload(option.value)}
            disabled={isLoading && selectedFormat !== option.value}
          >
            <svg
              class="button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {option.label}
          </Button>
        {/each}
      </div>
    </div>
  </div>
</Modal>

<style>
  .export-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Format Selection */
  .format-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ui-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .format-options {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .format-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--ui-border);
    border-radius: var(--ui-radius);
    background-color: var(--ui-surface);
    color: var(--ui-text);
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }

  .format-option:hover {
    border-color: var(--brand-color);
    background-color: var(--ui-bg);
  }

  .format-option.selected {
    border-color: var(--brand-color);
    background-color: var(--brand-color);
    color: white;
    box-shadow: var(--ui-shadow);
  }

  .format-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: calc(var(--ui-radius) / 2);
  }

  .format-option.selected .format-icon {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .format-label {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  /* Preview Section */
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .preview-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ui-text);
  }

  .preview-description {
    font-size: 0.875rem;
    color: var(--ui-text-muted);
  }

  .preview-content {
    background-color: var(--ui-bg);
    border: 1px solid var(--ui-border);
    border-radius: var(--ui-radius);
    max-height: 300px;
    overflow: auto;
  }

  .preview-code {
    padding: 1rem;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--ui-text);
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: var(--ui-text-muted);
    background-color: var(--ui-bg);
    border: 1px dashed var(--ui-border);
    border-radius: var(--ui-radius);
  }

  .loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Error State */
  .error-state {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: var(--ui-radius);
    color: rgb(220, 38, 38);
  }

  .error-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  /* PDF Placeholder */
  .pdf-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    background-color: var(--ui-bg);
    border: 1px dashed var(--ui-border);
    border-radius: var(--ui-radius);
    color: var(--ui-text-muted);
  }

  .pdf-icon {
    width: 3rem;
    height: 3rem;
    stroke: var(--brand-color);
  }

  .pdf-note {
    font-size: 0.8125rem;
    font-style: italic;
  }

  /* Action Section */
  .action-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--ui-border);
    flex-wrap: wrap;
  }

  .download-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 1;
  }

  .button-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .format-options {
      flex-direction: column;
    }

    .format-option {
      justify-content: flex-start;
    }

    .action-section {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .download-buttons {
      justify-content: stretch;
    }

    .download-buttons :global(button) {
      flex: 1;
    }
  }

  @media (max-width: 480px) {
    .preview-content {
      max-height: 200px;
    }
  }
</style>

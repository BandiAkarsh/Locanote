<!--
  AIStatusBar.svelte
  
  Shows AI system status in the UI
  Progressive disclosure: minimal by default, expandable for details
-->
<script lang="ts">
  import { aiState } from "$ai/stores.svelte";
  import {
    Sparkles,
    Cpu,
    Zap,
    Battery,
    BatteryLow,
    BatteryCharging,
    Settings,
  } from "lucide-svelte";
  import { slide, fade } from "svelte/transition";

  let expanded = $state(false);
  let showSettings = $state(false);

  let deviceTierLabel = $derived(() => {
    const labels: Record<string, string> = {
      high: "High Performance",
      medium: "Balanced",
      low: "Efficiency Mode",
      unknown: "Detecting...",
    };
    return labels[aiState.deviceTier] || labels["unknown"];
  });

  let batteryIcon = $derived(() => {
    if (!aiState.batteryStatus) return Battery;
    if (aiState.batteryStatus.charging) return BatteryCharging;
    if (aiState.batteryStatus.level < 0.2) return BatteryLow;
    return Battery;
  });

  let batteryColor = $derived(() => {
    if (!aiState.batteryStatus) return "var(--ui-text-muted)";
    if (aiState.batteryStatus.level < 0.2) return "var(--ui-error)";
    if (aiState.batteryStatus.level < 0.5) return "var(--ui-warning)";
    return "var(--ui-success)";
  });

  let activeFeatures = $derived(
    [
      aiState.autoTagging && "Auto-Tag",
      aiState.semanticSearch && "Search",
      aiState.summarization && "Summarize",
      aiState.writingAssistant && "Writing",
      aiState.smartLinks && "Links",
    ].filter(Boolean),
  );
</script>

<div class="ai-status-bar" class:expanded>
  <button
    class="status-toggle"
    onclick={() => (expanded = !expanded)}
    type="button"
    aria-expanded={expanded}
  >
    <div class="status-main">
      <div class="status-icon" class:active={aiState.isInitialized}>
        <Sparkles size={16} />
      </div>

      {#if aiState.isLoading}
        <span class="status-text">Initializing AI...</span>
      {:else if aiState.isInitialized}
        <span class="status-text">{activeFeatures.length} features active</span>
      {:else}
        <span class="status-text">AI unavailable</span>
      {/if}
    </div>

    <div class="status-indicators">
      {#if aiState.hardwareCapabilities}
        {#if aiState.hasGPU}
          <span title="GPU Accelerated">
            <Zap size={14} class="indicator gpu" />
          </span>
        {:else}
          <span title="CPU Mode">
            <Cpu size={14} class="indicator cpu" />
          </span>
        {/if}

        {#if aiState.batteryStatus}
          {@const BatteryComponent = batteryIcon()}
          {@const batteryLevel = Math.round(
            (aiState.batteryStatus?.level || 0) * 100,
          )}
          <div
            class="indicator"
            style="color: {batteryColor()}"
            title="Battery: {batteryLevel}%"
          >
            <BatteryComponent size={14} />
          </div>
        {/if}
      {/if}
    </div>
  </button>

  {#if expanded}
    <div class="status-details" transition:slide={{ duration: 200 }}>
      <div class="detail-section">
        <h4>Hardware</h4>
        <div class="detail-row">
          <span>Mode:</span>
          <span class="tier-badge">{deviceTierLabel}</span>
        </div>
        {#if aiState.hardwareCapabilities}
          <div class="detail-row">
            <span>GPU:</span>
            <span>{aiState.hasGPU ? "Available" : "Not available"}</span>
          </div>
          <div class="detail-row">
            <span>Cores:</span>
            <span>{aiState.hardwareCapabilities.cpuCores}</span>
          </div>
        {/if}
      </div>

      <div class="detail-section">
        <h4>Active Features</h4>
        <div class="feature-toggles">
          <label class="toggle">
            <input
              type="checkbox"
              checked={aiState.autoTagging}
              onchange={() => aiState.toggleFeature("auto-tagging")}
            />
            <span>Auto-Tagging</span>
          </label>
          <label class="toggle">
            <input
              type="checkbox"
              checked={aiState.semanticSearch}
              onchange={() => aiState.toggleFeature("semantic-search")}
            />
            <span>Semantic Search</span>
          </label>
          <label class="toggle">
            <input
              type="checkbox"
              checked={aiState.summarization}
              onchange={() => aiState.toggleFeature("summarization")}
            />
            <span>Summarization</span>
          </label>
          <label class="toggle">
            <input
              type="checkbox"
              checked={aiState.writingAssistant}
              onchange={() => aiState.toggleFeature("writing-assistant")}
            />
            <span>Writing Assistant</span>
          </label>
          <label class="toggle">
            <input
              type="checkbox"
              checked={aiState.smartLinks}
              onchange={() => aiState.toggleFeature("smart-links")}
            />
            <span>Smart Links</span>
          </label>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-status-bar {
    background: var(--ui-surface);
    border: 1px solid var(--ui-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .status-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    gap: 1rem;
  }

  .status-toggle:hover {
    background: var(--ui-surface-hover);
  }

  .status-main {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-icon {
    color: var(--ui-text-muted);
    transition: color 0.3s ease;
  }

  .status-icon.active {
    color: var(--ui-accent);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .status-text {
    font-size: 0.75rem;
    color: var(--ui-text);
  }

  .status-indicators {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .indicator {
    color: var(--ui-text-muted);
  }

  .indicator.gpu {
    color: var(--ui-accent);
  }

  .status-details {
    border-top: 1px solid var(--ui-border);
    padding: 0.75rem;
  }

  .detail-section {
    margin-bottom: 1rem;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .detail-section h4 {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ui-text-muted);
    margin: 0 0 0.5rem 0;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    padding: 0.25rem 0;
  }

  .detail-row span:first-child {
    color: var(--ui-text-muted);
  }

  .tier-badge {
    padding: 0.125rem 0.375rem;
    background: rgba(var(--ui-accent-rgb), 0.1);
    color: var(--ui-accent);
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }

  .feature-toggles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .toggle input {
    cursor: pointer;
  }
</style>

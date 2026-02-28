<!-- =========================================================================
SIDEBAR COMPONENT - 2026 Neo-Minimalist Design
========================================================================
Clean navigation sidebar for the dashboard.

FEATURES:
- Collapsible sections
- Active state indicators
- Smooth animations
- Accessible keyboard navigation
- Mobile-responsive
======================================================================== -->

<script lang="ts">
  import type { Snippet } from "svelte";

  type NavItem = {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    active?: boolean;
    badge?: string | number;
    children?: NavItem[];
  };

  type Props = {
    brand?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    items?: NavItem[];
    activeItem?: string;
    onItemClick?: (item: NavItem) => void;
    collapsed?: boolean;
    class?: string;
  };

  let {
    brand,
    header,
    footer,
    items = [],
    activeItem,
    onItemClick,
    collapsed = false,
    class: className = "",
  }: Props = $props();

  let expandedSections = $state<Set<string>>(new Set());

  function toggleSection(id: string) {
    if (expandedSections.has(id)) {
      expandedSections.delete(id);
    } else {
      expandedSections.add(id);
    }
    expandedSections = new Set(expandedSections);
  }

  function handleItemClick(item: NavItem) {
    if (item.children && item.children.length > 0) {
      toggleSection(item.id);
    } else {
      onItemClick?.(item);
    }
  }

  function isExpanded(item: NavItem): boolean {
    return (
      expandedSections.has(item.id) || item.active || activeItem === item.id
    );
  }
</script>

<aside class="nm-sidebar {collapsed ? 'collapsed' : ''} {className}">
  <!-- Brand Section -->
  {#if brand}
    <div class="nm-sidebar-brand">
      {@render brand()}
    </div>
  {/if}

  <!-- Header Section -->
  {#if header}
    <div class="nm-sidebar-header">
      {@render header()}
    </div>
  {/if}

  <!-- Navigation -->
  <nav class="nm-sidebar-nav" aria-label="Main navigation">
    {#each items as section}
      <div class="nav-section">
        {#if section.label}
          <div class="nav-section-title">{section.label}</div>
        {/if}

        <ul class="nav-list" role="list">
          {#each section.children || [section] as item}
            <li class="nav-item-wrapper">
              <button
                class="nav-item"
                class:active={item.active || activeItem === item.id}
                onclick={() => handleItemClick(item)}
                aria-expanded={item.children ? isExpanded(item) : undefined}
                aria-current={item.active || activeItem === item.id
                  ? "page"
                  : undefined}
              >
                {#if item.icon}
                  <span class="nav-icon">
                    {@html item.icon}
                  </span>
                {/if}
                <span class="nav-label">{item.label}</span>
                {#if item.badge}
                  <span class="nav-badge">{item.badge}</span>
                {/if}
                {#if item.children}
                  <svg
                    class="nav-chevron"
                    class:expanded={isExpanded(item)}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                {/if}
              </button>

              {#if item.children && isExpanded(item)}
                <ul class="nav-submenu" role="list">
                  {#each item.children as child}
                    <li>
                      <button
                        class="nav-item nav-subitem"
                        class:active={child.active || activeItem === child.id}
                        onclick={() => onItemClick?.(child)}
                        aria-current={child.active || activeItem === child.id
                          ? "page"
                          : undefined}
                      >
                        {child.label}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  <!-- Footer Section -->
  {#if footer}
    <div class="nm-sidebar-footer">
      {@render footer()}
    </div>
  {/if}
</aside>

<style>
  .nm-sidebar {
    width: var(--nm-sidebar-width);
    height: 100vh;
    background: var(--nm-bg-secondary);
    border-right: 1px solid var(--nm-border);
    display: flex;
    flex-direction: column;
    transition: width var(--nm-duration-normal) var(--nm-easing-smooth);
  }

  .nm-sidebar.collapsed {
    width: 72px;
  }

  .nm-sidebar-brand {
    height: var(--nm-header-height);
    padding: 0 var(--nm-space-5);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--nm-border);
    flex-shrink: 0;
  }

  .nm-sidebar-header {
    padding: var(--nm-space-4);
    border-bottom: 1px solid var(--nm-border);
    flex-shrink: 0;
  }

  .nm-sidebar-nav {
    flex: 1;
    padding: var(--nm-space-4);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .nm-sidebar-footer {
    padding: var(--nm-space-4);
    border-top: 1px solid var(--nm-border);
    flex-shrink: 0;
  }

  /* Navigation sections */
  .nav-section {
    margin-bottom: var(--nm-space-6);
  }

  .nav-section:last-child {
    margin-bottom: 0;
  }

  .nav-section-title {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--nm-text-muted);
    padding: 0 var(--nm-space-3);
    margin-bottom: var(--nm-space-2);
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Nav items */
  .nav-item-wrapper {
    margin-bottom: var(--nm-space-1);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--nm-space-3);
    width: 100%;
    padding: var(--nm-space-2) var(--nm-space-3);
    font-size: 0.9375rem;
    font-weight: 450;
    color: var(--nm-text-secondary);
    background: transparent;
    border: none;
    border-radius: var(--nm-radius);
    cursor: pointer;
    text-align: left;
    transition: all var(--nm-duration-fast) var(--nm-easing-smooth);
  }

  .nav-item:hover {
    background: var(--nm-accent-muted);
    color: var(--nm-accent);
  }

  .nav-item.active {
    background: var(--nm-accent-subtle);
    color: var(--nm-accent);
    font-weight: 500;
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--nm-accent);
    outline-offset: 2px;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .nav-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .nav-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 2px 6px;
    background: var(--nm-accent);
    color: white;
    border-radius: var(--nm-radius-full);
    min-width: 18px;
    text-align: center;
  }

  .nav-chevron {
    width: 16px;
    height: 16px;
    transition: transform var(--nm-duration-fast) var(--nm-easing-smooth);
    flex-shrink: 0;
  }

  .nav-chevron.expanded {
    transform: rotate(90deg);
  }

  /* Submenu */
  .nav-submenu {
    list-style: none;
    margin: var(--nm-space-1) 0 0;
    padding: 0 0 0 var(--nm-space-8);
  }

  .nav-subitem {
    font-size: 0.875rem;
    padding: var(--nm-space-1) var(--nm-space-3);
  }

  /* Collapsed state */
  .collapsed .nav-label,
  .collapsed .nav-badge,
  .collapsed .nav-chevron,
  .collapsed .nav-section-title {
    display: none;
  }

  .collapsed .nav-item {
    justify-content: center;
    padding: var(--nm-space-3);
  }

  .collapsed .nav-icon {
    width: 24px;
    height: 24px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .nm-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transform: translateX(-100%);
    }

    .nm-sidebar:not(.collapsed) {
      transform: translateX(0);
    }
  }
</style>

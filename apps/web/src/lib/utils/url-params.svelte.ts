// ============================================================================
// URL PARAMETERS UTILITY (url-params.svelte.ts)
// ============================================================================
// Reactive URL parameter management for bookmarkable search state.
// Synchronizes search query, active tag, and view mode with URL query params.
//
// WHY?
// - Users can bookmark specific search states
// - Back/forward browser buttons work as expected
// - Shareable links with pre-applied filters
//
// USAGE:
// const params = createUrlParams();
// params.search = 'meeting';
// params.tag = 'work';
// params.view = 'grid';
// ============================================================================

import { isBrowser } from './browser';

/**
 * Valid URL parameter keys
 */
export type UrlParamKey = 'search' | 'tag' | 'view';

/**
 * Valid view modes
 */
export type ViewMode = 'grid' | 'list';

/**
 * URL parameter state interface
 */
export interface UrlParamsState {
  search: string;
  tag: string | null;
  view: ViewMode;
}

/**
 * Get current URL search params as a Map
 */
function getSearchParams(): URLSearchParams {
  if (!isBrowser) {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Update URL without page reload using History API
 */
function updateUrl(params: URLSearchParams, replace: boolean = false): void {
  if (!isBrowser) return;

  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;

  if (replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
}

/**
 * Read a query parameter value
 * @param key - Parameter key
 * @param defaultValue - Default value if param not present
 * @returns Parameter value or default
 */
export function getParam(key: UrlParamKey, defaultValue: string = ''): string {
  const params = getSearchParams();
  return params.get(key) ?? defaultValue;
}

/**
 * Read a query parameter value with null support
 * @param key - Parameter key
 * @returns Parameter value or null
 */
export function getParamOrNull(key: UrlParamKey): string | null {
  const params = getSearchParams();
  return params.get(key);
}

/**
 * Set a query parameter value
 * @param key - Parameter key
 * @param value - Value to set (null to remove)
 * @param options - Options for update
 */
export function setParam(
  key: UrlParamKey,
  value: string | null,
  options: { replace?: boolean } = {}
): void {
  const params = getSearchParams();

  if (value === null || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  updateUrl(params, options.replace);
}

/**
 * Remove a query parameter
 * @param key - Parameter key to remove
 * @param options - Options for update
 */
export function removeParam(key: UrlParamKey, options: { replace?: boolean } = {}): void {
  setParam(key, null, options);
}

/**
 * Set multiple parameters at once
 * @param updates - Object with key-value pairs to set
 * @param options - Options for update
 */
export function setParams(
  updates: Partial<Record<UrlParamKey, string | null>>,
  options: { replace?: boolean } = {}
): void {
  const params = getSearchParams();

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  updateUrl(params, options.replace);
}

/**
 * Clear all query parameters
 * @param options - Options for update
 */
export function clearParams(options: { replace?: boolean } = {}): void {
  if (!isBrowser) return;
  updateUrl(new URLSearchParams(), options.replace);
}

/**
 * Get all current parameters as an object
 * @returns Current URL parameters state
 */
export function getAllParams(): UrlParamsState {
  return {
    search: getParam('search', ''),
    tag: getParamOrNull('tag'),
    view: (getParam('view', 'grid') as ViewMode) === 'list' ? 'list' : 'grid'
  };
}

/**
 * Create a reactive URL parameters store
 * Automatically syncs with browser URL and provides reactive updates
 * @returns Reactive store with get/set methods
 */
export function createUrlParams() {
  let search = $state(getParam('search', ''));
  let tag = $state<string | null>(getParamOrNull('tag'));
  let view = $state<ViewMode>(getParam('view', 'grid') === 'list' ? 'list' : 'grid');

  // Sync state to URL when values change
  $effect(() => {
    if (!isBrowser) return;

    const updates: Partial<Record<UrlParamKey, string | null>> = {};

    if (search) {
      updates.search = search;
    } else {
      updates.search = null;
    }

    if (tag) {
      updates.tag = tag;
    } else {
      updates.tag = null;
    }

    if (view !== 'grid') {
      updates.view = view;
    } else {
      updates.view = null;
    }

    setParams(updates, { replace: true });
  });

  // Listen to popstate events (back/forward buttons)
  if (isBrowser) {
    window.addEventListener('popstate', () => {
      search = getParam('search', '');
      tag = getParamOrNull('tag');
      view = getParam('view', 'grid') === 'list' ? 'list' : 'grid';
    });
  }

  return {
    get search() {
      return search;
    },
    set search(value: string) {
      search = value;
    },
    get tag() {
      return tag;
    },
    set tag(value: string | null) {
      tag = value;
    },
    get view() {
      return view;
    },
    set view(value: ViewMode) {
      view = value;
    },

    /**
     * Clear all parameters and reset to defaults
     */
    clear() {
      search = '';
      tag = null;
      view = 'grid';
    },

    /**
     * Set all parameters from an object
     */
    setAll(params: Partial<UrlParamsState>) {
      if (params.search !== undefined) search = params.search;
      if (params.tag !== undefined) tag = params.tag;
      if (params.view !== undefined) view = params.view;
    },

    /**
     * Get current state as a plain object
     */
    toObject(): UrlParamsState {
      return {
        search,
        tag,
        view
      };
    },

    /**
     * Build a shareable URL with current parameters
     */
    toUrl(): string {
      if (!isBrowser) return '';
      const params = getSearchParams();
      return `${window.location.origin}${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    }
  };
}

/**
 * Hook for syncing search state with URL parameters
 * Combines URL params with a SearchBar component
 * @returns Object with state and helper functions
 */
export function useSearchWithUrl() {
  const params = createUrlParams();

  function handleSearch(query: string) {
    params.search = query;
  }

  function handleTagSelect(tag: string | null) {
    params.tag = tag;
  }

  function handleClear() {
    params.clear();
  }

  function setViewMode(view: ViewMode) {
    params.view = view;
  }

  return {
    get search() {
      return params.search;
    },
    get tag() {
      return params.tag;
    },
    get view() {
      return params.view;
    },
    handleSearch,
    handleTagSelect,
    handleClear,
    setViewMode,
    get params() {
      return params;
    }
  };
}

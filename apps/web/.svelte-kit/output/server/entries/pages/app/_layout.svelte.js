import { a as attr } from "../../../chunks/attributes.js";
import { k as escape_html } from "../../../chunks/escaping.js";
import { a as auth } from "../../../chunks/auth.svelte.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { n as networkStatus } from "../../../chunks/network.svelte.js";
const STORAGE_KEY = "locanote-theme";
const isBrowser = typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined";
function getStoredTheme() {
  if (!isBrowser) return "system";
  const stored = globalThis.window?.localStorage?.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}
function systemPrefersDark() {
  if (!isBrowser) return false;
  return globalThis.window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}
function applyTheme(theme2) {
  if (!isBrowser) return;
  const win = globalThis.window;
  const doc = win?.document;
  if (!doc) return;
  const html = doc.documentElement;
  const isDark2 = systemPrefersDark();
  if (isDark2) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
let currentTheme = getStoredTheme();
if (isBrowser) {
  const mediaQuery = globalThis.window?.matchMedia?.("(prefers-color-scheme: dark)");
  if (mediaQuery) {
    mediaQuery.addEventListener("change", (e) => {
      if (currentTheme === "system") {
        applyTheme();
      }
    });
  }
}
let isDark = currentTheme === "dark" || currentTheme === "system" && systemPrefersDark();
const theme = {
  get isDark() {
    return isDark;
  }
};
function OfflineBanner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let shouldShow = !networkStatus.isOnline;
    if (shouldShow) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 shadow-lg"><div class="max-w-7xl mx-auto flex items-center justify-between"><div class="flex items-center gap-3"><svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg> <div><p class="font-semibold text-sm">You're offline</p> <p class="text-xs opacity-80">Your notes are still available. Changes will sync when you're back online.</p></div></div> <div class="flex items-center gap-2"><button class="p-1 hover:bg-yellow-600/20 rounded transition-colors" aria-label="Toggle details"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button> <button class="p-1 hover:bg-yellow-600/20 rounded transition-colors" aria-label="Retry connection"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button></div></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    OfflineBanner($$renderer2);
    $$renderer2.push(`<!----> `);
    if (
      // Initialize auth on mount
      // Watch auth state and redirect if not authenticated
      auth.isAuthenticated
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="min-h-screen bg-gray-50 dark:bg-gray-900"><header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><span class="text-white font-bold text-sm">L</span></div> <span class="font-semibold text-gray-900 dark:text-white">Locanote</span></div> <div class="flex items-center gap-4">`);
      if (auth.session) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-sm text-gray-600 dark:text-gray-400">${escape_html(auth.session.username)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"${attr("title", theme.isDark ? "Switch to light mode" : "Switch to dark mode")}${attr("aria-label", theme.isDark ? "Switch to light mode" : "Switch to dark mode")}>`);
      if (theme.isDark) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`);
      }
      $$renderer2.push(`<!--]--></button> <button class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Logout</button></div></div></div></header> <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div class="animate-pulse text-gray-400">Loading...</div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _layout as default
};

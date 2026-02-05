// ============================================================================
// SVELTEKIT CONFIGURATION FILE
// ============================================================================
// This file tells SvelteKit how to build and configure your application.
// It's like a recipe that says "use these ingredients and cook this way."
//
// KEY CONCEPTS:
// - Adapter: How to package the app for deployment (static, Node, Cloudflare, etc.)
// - Prerender: Generate HTML at build time (faster initial load)
// - Alias: Shortcuts for import paths (e.g., $lib instead of ../../../lib)
// ============================================================================

import adapter from "@sveltejs/adapter-static"; // Import the static adapter - builds to plain HTML/CSS/JS
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"; // Preprocessor for TypeScript, SCSS, etc.

/** @type {import('@sveltejs/kit').Config} */ // TypeScript type hint for IDE autocomplete
const config = {
  // ========================================================================
  // PREPROCESSORS
  // ========================================================================
  // Preprocessors transform your code before Svelte compiles it.
  // vitePreprocess handles: TypeScript, PostCSS, SCSS, etc.
  preprocess: vitePreprocess(),

  // ========================================================================
  // COMPILER OPTIONS (Svelte 5 Enforcement)
  // ========================================================================
  compilerOptions: {
    runes: true, // Enforce Runes mode (disables legacy features)
    modernAst: true,
  },

  kit: {
    // ====================================================================
    // ADAPTER CONFIGURATION
    // ====================================================================
    // The adapter determines how your app is packaged for deployment.
    // adapter-static creates plain HTML/CSS/JS files (perfect for Cloudflare Pages).
    //
    // WHY STATIC?
    // - No server needed (cheaper, simpler)
    // - Can be hosted anywhere (Cloudflare, Netlify, GitHub Pages)
    // - Still fully interactive (JavaScript runs in browser)
    adapter: adapter({
      pages: "build", // Output folder for HTML pages
      assets: "build", // Output folder for static assets (JS, CSS, images)
      fallback: "index.html", // SPA fallback - all routes serve this file
      precompress: true, // Generate .gz and .br compressed versions
      strict: true, // Fail build if any page can't be prerendered
    }),

    // ====================================================================
    // PATH ALIASES
    // ====================================================================
    // These let you use short import paths instead of relative paths.
    // Example: import { something } from '$lib/utils' instead of '../../../lib/utils'
    alias: {
      $components: "src/lib/components", // $components → src/lib/components
      $stores: "src/lib/stores", // $stores → src/lib/stores
      $auth: "src/lib/auth", // $auth → src/lib/auth
      $crdt: "src/lib/crdt", // $crdt → src/lib/crdt
      $editor: "src/lib/editor", // $editor → src/lib/editor
      $crypto: "src/lib/crypto", // $crypto → src/lib/crypto
      $db: "src/lib/db", // $db → src/lib/db
      $services: "src/lib/services", // $services → src/lib/services
      $utils: "src/lib/utils", // $utils → src/lib/utils
    },
  },
};

export default config; // Export the config for SvelteKit to use

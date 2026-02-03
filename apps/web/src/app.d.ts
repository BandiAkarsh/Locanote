// ============================================================================
// SVELTEKIT TYPE DEFINITIONS
// ============================================================================
// This file tells TypeScript about SvelteKit's special types.
// It's automatically generated but I can extend it.
//
// WHAT ARE .d.ts FILES?
// They're "declaration files" - they describe types without actual code.
// Think of them as instruction manuals that tell TypeScript what things are.
//
// WHY DO WE NEED THIS?
// SvelteKit has special features like $app/environment, $app/navigation, etc.
// This file imports their type definitions so TypeScript understands them.
// ============================================================================

// See https://svelte.dev/docs/kit/types#app.d.ts

// ============================================================================
// DECLARE THE APP NAMESPACE
// ============================================================================
// This namespace contains types that are specific to YOUR application.
// You can add custom properties to these interfaces.

declare global {
	namespace App {
		// ====================================================================
		// ERROR TYPE
		// ====================================================================
		// Customize what your error objects look like.
		// Example: interface Error { code: string; message: string; }
		// interface Error {}

		// ====================================================================
		// LOCALS TYPE
		// ====================================================================
		// Data that's available in all server-side code (hooks, endpoints).
		// Since I're building a static app, I don't use this much.
		// interface Locals {}

		// ====================================================================
		// PAGE DATA TYPE
		// ====================================================================
		// Data that's passed from +page.ts load functions to +page.svelte.
		// interface PageData {}

		// ====================================================================
		// PAGE STATE TYPE
		// ====================================================================
		// State that persists across navigation (using pushState/replaceState).
		// interface PageState {}

		// ====================================================================
		// PLATFORM TYPE
		// ====================================================================
		// Platform-specific context (Cloudflare Workers, Vercel, etc.).
		// interface Platform {}
	}
}

// ============================================================================
// MAKE THIS A MODULE
// ============================================================================
// The empty export makes this file a "module" instead of a "script".
// This is required for the `declare global` block to work correctly.
export {};

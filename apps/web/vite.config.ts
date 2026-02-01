import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],

	resolve: {
		alias: [
			{ find: '$lib', replacement: path.resolve('src/lib') },
			{ find: '$components', replacement: path.resolve('src/lib/components') },
			{ find: '$stores', replacement: path.resolve('src/lib/stores') },
			{ find: '$auth', replacement: path.resolve('src/lib/auth') },
			{ find: '$crdt', replacement: path.resolve('src/lib/crdt') },
			{ find: '$editor', replacement: path.resolve('src/lib/editor') },
			{ find: '$crypto', replacement: path.resolve('src/lib/crypto') },
			{ find: '$db', replacement: path.resolve('src/lib/db') },
			{ find: '$services', replacement: path.resolve('src/lib/services') }
		]
	},

	optimizeDeps: {
		exclude: ['y-webrtc']
	},

	build: {
		target: 'esnext'
	},

	server: {
		fs: {
			allow: ['..']                                            // Allow access to parent directories
		},
		// Ensure proper Content-Type headers for UTF-8 encoding
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	}
});

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],

  resolve: {
    alias: [
      { find: "$lib", replacement: path.resolve("src/lib") },
      { find: "$components", replacement: path.resolve("src/lib/components") },
      { find: "$stores", replacement: path.resolve("src/lib/stores") },
      { find: "$auth", replacement: path.resolve("src/lib/auth") },
      { find: "$crdt", replacement: path.resolve("src/lib/crdt") },
      { find: "$editor", replacement: path.resolve("src/lib/editor") },
      { find: "$crypto", replacement: path.resolve("src/lib/crypto") },
      { find: "$db", replacement: path.resolve("src/lib/db") },
      { find: "$services", replacement: path.resolve("src/lib/services") },
      { find: "$utils", replacement: path.resolve("src/lib/utils") },
    ],
  },

  optimizeDeps: {
    include: ["y-webrtc", "y-indexeddb", "yjs"],
    exclude: [],
  },

  build: {
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
  },

  server: {
    fs: {
      allow: [".."], // Allow access to parent directories
    },
    // Fix MIME types for module scripts
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5174,
    },
  },

  // Ensure proper MIME types for all file types
  esbuild: {
    target: "esnext",
    format: "esm",
  },
});

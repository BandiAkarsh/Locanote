/**
 * Vite Configuration for AI Features
 *
 * Add this to your vite.config.ts to enable WebGPU and optimize AI dependencies
 */

import type { UserConfig } from "vite";

export const aiConfig: UserConfig = {
  // Required for WebGPU and AI libraries
  build: {
    target: "esnext", // WebGPU requires ES2022+
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate AI libraries into their own chunks
          "ai-core": ["@mlc-ai/web-llm"],
          "ai-transformers": ["@huggingface/transformers"],
          "ai-onnx": ["onnxruntime-web"],
        },
      },
    },
  },

  optimizeDeps: {
    // These libraries need to be excluded from optimization
    // They use Web Workers and WASM internally
    exclude: [
      "@mlc-ai/web-llm",
      "@huggingface/transformers",
      "onnxruntime-web",
    ],
    include: [
      // Pre-bundle these for faster dev startup
      "hnswlib-node",
    ],
  },

  server: {
    // Required headers for WebGPU and SharedArrayBuffer
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  // Handle WASM files properly
  assetsInclude: ["**/*.wasm", "**/*.onnx", "**/*.gguf"],

  // Worker configuration
  worker: {
    format: "es",
  },
};

// Helper to merge with existing config
export function mergeWithAIConfig(existingConfig: UserConfig): UserConfig {
  const existingManualChunks = (
    existingConfig.build?.rollupOptions?.output as
      | { manualChunks?: Record<string, string[]> }
      | undefined
  )?.manualChunks;

  return {
    ...existingConfig,
    build: {
      ...existingConfig.build,
      target: "esnext",
      rollupOptions: {
        ...existingConfig.build?.rollupOptions,
        output: {
          manualChunks: {
            ...existingManualChunks,
            "ai-core": ["@mlc-ai/web-llm"],
            "ai-transformers": ["@huggingface/transformers"],
            "ai-onnx": ["onnxruntime-web"],
          },
        },
      },
    },
    optimizeDeps: {
      ...existingConfig.optimizeDeps,
      exclude: [
        ...(existingConfig.optimizeDeps?.exclude || []),
        "@mlc-ai/web-llm",
        "@huggingface/transformers",
        "onnxruntime-web",
      ],
    },
    server: {
      ...existingConfig.server,
      headers: {
        ...existingConfig.server?.headers,
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
  };
}

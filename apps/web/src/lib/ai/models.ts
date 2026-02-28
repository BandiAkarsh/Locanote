/**
 * AI Model Registry
 *
 * Defines available models and their requirements
 */

import type { AIModel, AITask } from "./types.js";

// Model registry with all available models
export const MODEL_REGISTRY: Record<string, AIModel> = {
  // Embedding Models
  "bge-m3": {
    id: "bge-m3",
    name: "BGE-M3 Multilingual Embeddings",
    task: "embedding-generation",
    size: 2200, // MB (Q4)
    quantization: "Q4",
    minTier: "medium",
    webgpu: true,
    webnn: false,
    wasm: true,
    huggingfaceId: "Xenova/bge-m3",
    vramRequired: 2500,
  },
  "all-MiniLM-L6": {
    id: "all-MiniLM-L6",
    name: "All MiniLM L6 (Lightweight)",
    task: "embedding-generation",
    size: 80, // MB
    quantization: "FP32",
    minTier: "low",
    webgpu: true,
    webnn: true,
    wasm: true,
    huggingfaceId: "Xenova/all-MiniLM-L6-v2",
    vramRequired: 100,
  },

  // Classification Models
  "mobilebert-mnli": {
    id: "mobilebert-mnli",
    name: "MobileBERT MNLI (Zero-shot)",
    task: "classification",
    size: 100, // MB
    quantization: "Q8",
    minTier: "low",
    webgpu: true,
    webnn: true,
    wasm: true,
    huggingfaceId: "Xenova/mobilebert-uncased-mnli",
    vramRequired: 150,
  },

  // Summarization
  "distilbart-cnn": {
    id: "distilbart-cnn",
    name: "DistilBART CNN (Summarization)",
    task: "summarize",
    size: 400, // MB
    quantization: "Q4",
    minTier: "medium",
    webgpu: true,
    webnn: false,
    wasm: true,
    huggingfaceId: "Xenova/distilbart-cnn-12-6",
    vramRequired: 500,
  },

  // Grammar/Writing
  "t5-grammar": {
    id: "t5-grammar",
    name: "T5 Grammar Correction",
    task: "grammar-check",
    size: 240, // MB
    quantization: "Q4",
    minTier: "medium",
    webgpu: true,
    webnn: false,
    wasm: true,
    huggingfaceId: "Xenova/t5-base-grammar-correction",
    vramRequired: 300,
  },

  // LLM Models (via WebLLM)
  "llama-3.2-1b": {
    id: "llama-3.2-1b",
    name: "Llama 3.2 1B Instruct",
    task: "completion",
    size: 750, // MB (Q4)
    quantization: "Q4",
    minTier: "low",
    webgpu: true,
    webnn: false,
    wasm: false,
    huggingfaceId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    vramRequired: 1000,
  },
  "llama-3.2-3b": {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B Instruct",
    task: "completion",
    size: 1900, // MB (Q4)
    quantization: "Q4",
    minTier: "medium",
    webgpu: true,
    webnn: false,
    wasm: false,
    huggingfaceId: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
    vramRequired: 2200,
  },
  "gemma-2b": {
    id: "gemma-2b",
    name: "Gemma 2B Instruct",
    task: "completion",
    size: 1500, // MB (Q4)
    quantization: "Q4",
    minTier: "low",
    webgpu: true,
    webnn: false,
    wasm: false,
    huggingfaceId: "gemma-2b-it-q4f32_1-MLC",
    vramRequired: 1800,
  },
  "phi-3-mini": {
    id: "phi-3-mini",
    name: "Phi-3 Mini Instruct",
    task: "completion",
    size: 1800, // MB (Q4)
    quantization: "Q4",
    minTier: "medium",
    webgpu: true,
    webnn: false,
    wasm: false,
    huggingfaceId: "Phi-3-mini-4k-instruct-q4f32_1-MLC",
    vramRequired: 2200,
  },
};

// Model selection based on task and hardware
export function selectModelForTask(
  task: AITask,
  deviceTier: "high" | "medium" | "low",
  preferQuality: boolean = false,
): string | null {
  const candidates = Object.values(MODEL_REGISTRY)
    .filter((m) => m.task === task)
    .filter((m) => {
      // Filter by tier compatibility
      if (deviceTier === "high") return true;
      if (deviceTier === "medium") return m.minTier !== "high";
      return m.minTier === "low";
    })
    .sort((a, b) => {
      if (preferQuality) {
        // Prefer larger, better models
        return b.size - a.size;
      } else {
        // Prefer smaller, faster models
        return a.size - b.size;
      }
    });

  return candidates[0]?.id || null;
}

// Task to default model mapping
export const DEFAULT_MODELS: Record<AITask, string> = {
  "embedding-generation": "all-MiniLM-L6",
  classification: "mobilebert-mnli",
  summarize: "distilbart-cnn",
  "grammar-check": "t5-grammar",
  completion: "gemma-2b",
  "tag-suggestion": "mobilebert-mnli",
  "semantic-search": "all-MiniLM-L6",
};

// Get model by ID
export function getModel(modelId: string): AIModel | undefined {
  return MODEL_REGISTRY[modelId];
}

// Get all models for a task
export function getModelsForTask(task: AITask): AIModel[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.task === task);
}

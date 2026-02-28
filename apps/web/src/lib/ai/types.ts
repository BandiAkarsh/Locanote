/**
 * AI Module - Core Types and Interfaces
 *
 * Privacy-first on-device AI for Locanote
 */

// Hardware Capabilities
export interface HardwareCapabilities {
  webgpu: boolean;
  webnn: boolean;
  gpuMemory: number; // MB
  cpuCores: number;
  isBatteryPowered: boolean;
  batteryLevel: number;
  deviceTier: "high" | "medium" | "low";
}

// AI Tasks
export type AITask =
  | "tag-suggestion"
  | "semantic-search"
  | "summarize"
  | "grammar-check"
  | "completion"
  | "embedding-generation"
  | "classification";

export type Priority = "critical" | "high" | "normal" | "low" | "background";

export type PowerMode = "performance" | "balanced" | "efficiency";

// Models
export interface AIModel {
  id: string;
  name: string;
  task: AITask;
  size: number; // MB
  quantization: "Q4" | "Q8" | "FP16" | "FP32";
  minTier: "high" | "medium" | "low";
  webgpu: boolean;
  webnn: boolean;
  wasm: boolean;
  huggingfaceId: string;
  vramRequired: number; // MB
}

// Task Management
export interface AITaskRequest {
  id: string;
  type: AITask;
  input: unknown;
  priority: Priority;
  timestamp: number;
  abortSignal?: AbortSignal;
}

export interface AITaskResult {
  taskId: string;
  success: boolean;
  data?: unknown;
  error?: AIError;
  processingTime: number;
}

export interface AIError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface AIProgress {
  taskId: string;
  stage: "queued" | "loading-model" | "processing" | "complete" | "error";
  progress: number; // 0-100
  message: string;
}

// Features
export type AIFeature =
  | "auto-tagging"
  | "semantic-search"
  | "summarization"
  | "writing-assistant"
  | "smart-links";

// Tag Suggestions
export interface TagSuggestion {
  tag: string;
  confidence: number;
  isNew: boolean;
  reason?: string;
}

// Search
export interface SearchResult {
  noteId: string;
  score: number;
  content: string;
  highlight?: string;
}

// Writing
export interface WritingSuggestion {
  text: string;
  type: "completion" | "correction" | "enhancement";
  confidence: number;
  start: number;
  end: number;
  explanation?: string;
}

export type SummaryStyle = "concise" | "detailed" | "bullet-points";

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

// Smart Links
export interface RelatedNote {
  noteId: string;
  similarity: number;
  context: string;
}

// Model Manager
export interface LoadOptions {
  priority?: Priority;
  keepInMemory?: boolean;
  quantization?: "Q4" | "Q8";
}

export interface LoadedModel {
  id: string;
  instance: unknown;
  loadedAt: number;
  lastUsed: number;
  memoryUsage: number;
}

// Inference
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

// Vector Store
export interface DocumentMetadata {
  noteId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface VectorDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: Float32Array;
}

// Classification
export interface ClassificationResult {
  label: string;
  score: number;
  allLabels: Array<{ label: string; score: number }>;
}

// Battery
export interface BatteryInfo {
  charging: boolean;
  level: number;
  dischargingTime?: number;
  chargingTime?: number;
}

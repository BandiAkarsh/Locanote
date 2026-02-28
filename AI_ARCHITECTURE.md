# Locanote On-Device AI Architecture

> **Privacy-First AI System Design for Locanote (2026 Edition)**

## Executive Summary

Locanote's AI system runs entirely on-device using 2026's cutting-edge web AI technologies. This architecture ensures complete privacy while delivering intelligent features through local LLM inference, semantic search, and intelligent assistance.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Locanote AI Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Application Layer                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ Auto-Tag │ │Semantic  │ │ Summarize│ │ Writing  │ │ Smart    │  │   │
│  │  │  ging    │ │  Search  │ │    er    │ │ Assistant│ │  Links   │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────┘   │
│          │            │            │            │            │             │
│  ┌───────▼────────────▼────────────▼────────────▼────────────▼────────┐   │
│  │                      AI Orchestrator                                │   │
│  │     (Task Scheduling, Model Selection, Resource Management)         │   │
│  └───────┬──────────────────────────┬──────────────────────────┬────────┘   │
│          │                          │                          │             │
│  ┌───────▼───────────┐  ┌───────────▼───────────┐  ┌───────────▼────────┐   │
│  │   Model Manager   │  │   Inference Engine    │  │  Embedding Store   │   │
│  │                   │  │                       │  │                    │   │
│  │ • Model Registry  │  │ • WebLLM Runtime      │  │ • Vector DB        │   │
│  │ • Lazy Loading    │  │ • Transformers.js     │  │ • HNSW Index       │   │
│  │ • Quantization    │  │ • ONNX Runtime        │  │ • Incremental      │   │
│  │ • Caching         │  │ • WebGPU/WebNN        │  │   Updates          │   │
│  └───────────────────┘  └───────────────────────┘  └────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Hardware Abstraction                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐ │   │
│  │  │   WebGPU    │ │   WebNN     │ │ WebAssembly │ │  Fallback CPU  │ │   │
│  │  │   (GPU)     │ │   (NPU)     │ │   (WASM)    │ │   (Main Thread)│ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack (2026)

| Component        | Technology                    | Version | Purpose                             |
| ---------------- | ----------------------------- | ------- | ----------------------------------- |
| **LLM Engine**   | WebLLM                        | ^0.4.0  | High-performance LLM inference      |
| **Transformers** | @huggingface/transformers     | ^4.0.0  | Embeddings, classification          |
| **Runtime**      | ONNX Runtime Web              | ^1.18.0 | Cross-platform model execution      |
| **Acceleration** | WebGPU / WebNN                | Native  | Hardware acceleration               |
| **Vector Store** | HNSW-JS                       | ^4.0.0  | Approximate nearest neighbor search |
| **Workers**      | Web Workers / Service Workers | Native  | Background processing               |
| **Quantization** | GPTQ / AWQ / GGUF             | Latest  | Model compression                   |

---

## Core AI Modules

### 1. Model Manager (`lib/ai/manager.ts`)

Responsible for model lifecycle, lazy loading, and resource optimization.

```typescript
interface ModelManager {
  // Model Registry
  register(model: AIModel): void;

  // Lazy Loading
  load(modelId: string, options?: LoadOptions): Promise<LoadedModel>;
  unload(modelId: string): Promise<void>;

  // Resource Management
  getCapabilities(): HardwareCapabilities;
  selectOptimalModel(task: AITask): string;

  // Caching
  cacheModel(modelId: string): Promise<void>;
  clearCache(): Promise<void>;
}
```

### 2. Inference Engine (`lib/ai/inference.ts`)

Unified interface for all AI inference operations.

```typescript
interface InferenceEngine {
  // Text Generation
  generateText(prompt: string, options: GenerateOptions): AsyncIterable<string>;

  // Embeddings
  generateEmbedding(text: string): Promise<Float32Array>;

  // Classification
  classify(text: string, labels: string[]): Promise<ClassificationResult>;

  // Streaming Support
  streamGenerate(prompt: string): ReadableStream<string>;
}
```

### 3. Vector Store (`lib/ai/vector-store.ts`)

Local semantic search using HNSW indexing.

```typescript
interface VectorStore {
  // Document Management
  addDocument(id: string, content: string, metadata: Metadata): Promise<void>;
  removeDocument(id: string): Promise<void>;
  updateDocument(id: string, content: string): Promise<void>;

  // Search
  search(query: string, k: number): Promise<SearchResult[]>;
  searchByVector(vector: Float32Array, k: number): Promise<SearchResult[]>;

  // Index Management
  buildIndex(): Promise<void>;
  saveIndex(): Promise<void>;
  loadIndex(): Promise<void>;
}
```

### 4. AI Orchestrator (`lib/ai/orchestrator.ts`)

Central coordinator for all AI operations with battery awareness.

```typescript
interface AIOrchestrator {
  // Task Management
  scheduleTask(task: AITask, priority: Priority): Promise<TaskResult>;
  cancelTask(taskId: string): void;

  // Battery Awareness
  setPowerMode(mode: PowerMode): void;
  pauseOnLowBattery(): void;

  // Feature Toggles
  enableFeature(feature: AIFeature): void;
  disableFeature(feature: AIFeature): void;

  // Progress Tracking
  onProgress(callback: (progress: AIProgress) => void): () => void;
}
```

---

## Model Selection Strategy

### Hardware Capability Detection

```typescript
interface HardwareCapabilities {
  webgpu: boolean;
  webnn: boolean;
  gpuMemory: number; // MB
  cpuCores: number;
  isBatteryPowered: boolean;
  batteryLevel: number;
  deviceTier: "high" | "medium" | "low";
}
```

### Model Matrix

| Task               | High-End (GPU 8GB+) | Mid-Range (GPU 4GB) | Low-End (CPU/WASM) |
| ------------------ | ------------------- | ------------------- | ------------------ |
| **Text Gen**       | Llama 3.2 3B (Q4)   | Gemma 2B (Q4)       | SmolLM 135M (Q8)   |
| **Embeddings**     | BGE-M3 (Q4)         | E5-Base-v2 (Q4)     | MiniLM-L6 (FP32)   |
| **Summarization**  | BART-Large-CNN      | DistilBART          | T5-Small           |
| **Classification** | DeBERTa-V3          | DistilBERT          | TinyBERT           |

### Quantization Strategy

```
High-End:  Q4_K_M (4-bit, 4.5GB → 1.2GB)
Mid-Range: Q4_0 (4-bit, 4.5GB → 1.5GB)
Low-End:   Q8_0 (8-bit, 4.5GB → 2.8GB) or INT4
```

---

## AI Features Implementation

### Feature 1: Auto-Tagging

```typescript
// lib/ai/features/auto-tag.ts
interface AutoTagFeature {
  suggestTags(
    content: string,
    existingTags: string[],
  ): Promise<TagSuggestion[]>;
  autoApplyThreshold: number; // Confidence threshold (0-1)
}

// Implementation Strategy:
// 1. Use zero-shot classification with candidate labels
// 2. Extract keywords using NER
// 3. Match against existing tag library
// 4. Suggest new tags with confidence scores
```

**Models:**

- Primary: `Xenova/mobilebert-uncased-mnli` (zero-shot)
- Fallback: Keyword extraction with TF-IDF

### Feature 2: Semantic Search

```typescript
// lib/ai/features/semantic-search.ts
interface SemanticSearchFeature {
  indexNote(note: Note): Promise<void>;
  search(query: string): Promise<SearchResult[]>;
  findSimilar(noteId: string): Promise<SearchResult[]>;
}

// Implementation Strategy:
// 1. Generate embeddings using sentence-transformers
// 2. Store in HNSW vector index
// 3. Cosine similarity search
// 4. Hybrid search (semantic + keyword)
```

**Models:**

- Primary: `Xenova/bge-m3` (multilingual, 1024-dim)
- Fallback: `Xenova/all-MiniLM-L6-v2` (384-dim)

### Feature 3: Note Summarization

```typescript
// lib/ai/features/summarize.ts
interface SummarizeFeature {
  summarize(content: string, style: SummaryStyle): Promise<string>;
  generateTLDR(content: string): Promise<string>;
  extractKeyPoints(content: string, count: number): Promise<string[]>;
}

type SummaryStyle = "concise" | "detailed" | "bullet-points";
```

**Models:**

- Primary: BART-based summarization
- Streaming: Use WebLLM for custom summaries

### Feature 4: Writing Assistant

```typescript
// lib/ai/features/writing-assistant.ts
interface WritingAssistant {
  suggestCompletion(text: string, cursor: Position): Promise<Suggestion[]>;
  improveGrammar(text: string): Promise<GrammarCorrection[]>;
  enhanceStyle(text: string, tone: Tone): Promise<string>;
}

interface Suggestion {
  text: string;
  type: "completion" | "correction" | "enhancement";
  confidence: number;
  range: [number, number];
}
```

**Models:**

- Grammar: `Xenova/t5-base-grammar-correction`
- Completion: WebLLM with custom prompt

### Feature 5: Smart Links

```typescript
// lib/ai/features/smart-links.ts
interface SmartLinksFeature {
  findRelatedNotes(noteId: string): Promise<RelatedNote[]>;
  suggestConnections(noteIds: string[]): Promise<ConnectionSuggestion[]>;
  autoLink(content: string): Promise<AutoLink[]>;
}

interface RelatedNote {
  noteId: string;
  similarity: number;
  context: string; // Why they're related
}
```

---

## Worker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Main Thread (UI)                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  AI Context  │ │  AI Stores   │ │  AI UI Components    │    │
│  │   (Svelte 5) │ │   (Runes)    │ │  (GhostText, etc.)   │    │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘    │
└─────────┼────────────────┼────────────────────┼────────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AI Worker Thread                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AI Orchestrator                        │   │
│  │  (Task queue, priority management, resource monitoring) │   │
│  └──────────────┬────────────────────────────┬─────────────┘   │
│                 │                            │                  │
│    ┌────────────▼──────────┐    ┌───────────▼──────────┐       │
│    │   Inference Worker    │    │   Embedding Worker   │       │
│    │   (WebLLM, ONNX)      │    │   (Transformers.js)  │       │
│    └───────────────────────┘    └──────────────────────┘       │
│                                                                 │
│    ┌────────────┐ ┌────────────┐ ┌────────────────────────┐    │
│    │ Model Cache│ │ Vector DB  │ │ Progress/Result Stream │    │
│    │ (IndexedDB)│ │ (IndexedDB)│ │     (MessageChannel)   │    │
│    └────────────┘ └────────────┘ └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Battery & Performance Management

### Battery Awareness

```typescript
// lib/ai/battery-manager.ts
interface BatteryManager {
  // Monitor battery status
  getBatteryInfo(): Promise<BatteryInfo>;

  // Adaptive behavior
  onBatteryLow(callback: () => void): void;

  // Pause non-essential AI
  pauseBackgroundTasks(): void;

  // Resume when charging
  resumeWhenCharging(): void;
}

// Thresholds
const BATTERY_THRESHOLDS = {
  CRITICAL: 0.1, // Pause all AI
  LOW: 0.2, // Pause background indexing
  MEDIUM: 0.5, // Reduce model quality
  HIGH: 1.0, // Full performance
};
```

### Performance Tiers

| Tier       | Device Example     | Max Model       | Features Enabled           |
| ---------- | ------------------ | --------------- | -------------------------- |
| **Tier 1** | M3 Max, RTX 4090   | 7B Q4           | All features, real-time    |
| **Tier 2** | M2, RTX 3060       | 3B Q4           | All features, slight delay |
| **Tier 3** | Intel i7, GTX 1650 | 2B Q4           | Core features only         |
| **Tier 4** | Low-end laptop     | 135M Q8         | Basic features only        |
| **Tier 5** | Mobile/tablet      | Embeddings only | Search + tagging only      |

---

## Privacy & Security

### Data Handling Principles

1. **Zero Cloud**: No data ever leaves the device
2. **Local Processing**: All AI runs in-browser
3. **No Telemetry**: No usage analytics sent externally
4. **Encrypted Storage**: Models and embeddings encrypted at rest
5. **Memory Safety**: Automatic cleanup of sensitive data

### Federated Learning (Future)

```typescript
// lib/ai/federated/ (Future Implementation)
interface FederatedLearning {
  // Local training on user data
  localTrain(model: Model, data: LocalData): Promise<ModelUpdate>;

  // Differential privacy
  addNoise(update: ModelUpdate): ModelUpdate;

  // Secure aggregation (optional)
  submitUpdate(update: ModelUpdate): Promise<void>;
}
```

---

## Installation & Setup

```bash
# Install AI dependencies
pnpm add @mlc-ai/web-llm @huggingface/transformers onnxruntime-web

# Vector search
pnpm add hnswlib-node

# Development utilities
pnpm add -D @types/webgpu
```

### Vite Configuration

```typescript
// vite.config.ts additions
export default {
  optimizeDeps: {
    exclude: ["@mlc-ai/web-llm", "@huggingface/transformers"],
  },
  build: {
    target: "esnext", // Required for WebGPU
    rollupOptions: {
      output: {
        manualChunks: {
          "ai-core": ["@mlc-ai/web-llm"],
          "ai-transformers": ["@huggingface/transformers"],
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
};
```

---

## UI/UX Design

### Progressive Disclosure

```
Level 1 (Always Visible):
┌────────────────────────────────────┐
│ [AI ✨] Auto-suggestions: ON       │
└────────────────────────────────────┘

Level 2 (Hover/Click):
┌────────────────────────────────────┐
│ Auto-Tagging: ●●●○○ 3 tags added   │
│ Semantic Search: Indexed 42 notes  │
│ Writing Assistant: 5 suggestions   │
│ [Configure AI Features]            │
└────────────────────────────────────┘

Level 3 (Full Panel):
┌────────────────────────────────────┐
│ AI Settings                        │
│ ┌────────────────────────────────┐ │
│ │ Model: Gemma 2B (Q4)          │ │
│ │ Memory: 1.2GB / 8GB used      │ │
│ │ Battery Impact: Low           │ │
│ ├────────────────────────────────┤ │
│ │ [✓] Auto-tagging              │ │
│ │ [✓] Smart search              │ │
│ │ [ ] Real-time suggestions     │ │
│ │ [✓] Note summarization        │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Inline Suggestions (Ghost Text)

```
Note Content:
Meeting with the design team to discuss the new homepage layout...
                                              ^^^^^^^^^^^^^^^^^^^^^
                                              Ghost text suggestion
                                              (faded, Tab to accept)
```

### Confidence Indicators

```
AI Suggestion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add tag "project-management"?
[●●●●○ High confidence]

[Accept] [Dismiss] [See similar]
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

- [ ] Set up AI module structure
- [ ] Implement Model Manager
- [ ] Create Inference Engine wrapper
- [ ] Hardware capability detection
- [ ] Web Worker architecture

### Phase 2: Core Features (Weeks 3-4)

- [ ] Auto-tagging with zero-shot classification
- [ ] Semantic search with embeddings
- [ ] Vector store implementation
- [ ] Basic UI components

### Phase 3: Advanced Features (Weeks 5-6)

- [ ] Note summarization
- [ ] Writing assistant (grammar/style)
- [ ] Smart links between notes
- [ ] Command palette integration

### Phase 4: Optimization (Weeks 7-8)

- [ ] Model quantization setup
- [ ] Battery-aware scheduling
- [ ] Performance benchmarking
- [ ] Cache management
- [ ] Memory optimization

### Phase 5: Polish (Weeks 9-10)

- [ ] UI/UX refinement
- [ ] Confidence indicators
- [ ] Error handling
- [ ] Progress indicators
- [ ] User onboarding

---

## Performance Benchmarks

### Target Metrics

| Operation       | Target Time | Max Time | Notes         |
| --------------- | ----------- | -------- | ------------- |
| Model Load      | 2s          | 5s       | From cache    |
| First Inference | 500ms       | 2s       | Cold start    |
| Embedding Gen   | 50ms        | 200ms    | Per note      |
| Tag Suggestion  | 100ms       | 500ms    | 5-10 tags     |
| Semantic Search | 100ms       | 300ms    | 1000 notes    |
| Summary Gen     | 1s          | 3s       | 500 tokens    |
| Grammar Check   | 200ms       | 500ms    | Per paragraph |

### Memory Budgets

| Tier   | Model Cache | Vector DB | Working Memory | Total |
| ------ | ----------- | --------- | -------------- | ----- |
| High   | 4GB         | 500MB     | 500MB          | 5GB   |
| Medium | 2GB         | 200MB     | 300MB          | 2.5GB |
| Low    | 500MB       | 100MB     | 200MB          | 800MB |

---

## Testing Strategy

### Unit Tests

- Model loading/unloading
- Quantization accuracy
- Embedding generation
- Vector search accuracy

### Integration Tests

- End-to-end AI workflows
- Worker communication
- Battery-aware behavior
- Fallback mechanisms

### Performance Tests

- First Contentful Paint (AI)
- Time to Interactive (AI)
- Memory usage profiling
- Battery consumption

---

## Monitoring & Diagnostics

```typescript
// lib/ai/telemetry.ts (Local only)
interface AITelemetry {
  // Performance metrics
  logInferenceTime(task: string, duration: number): void;
  logModelLoadTime(modelId: string, duration: number): void;

  // Resource usage
  logMemoryUsage(): void;
  logGPUUtilization(): void;

  // Error tracking
  logError(error: AIError): void;

  // Export for debugging
  exportReport(): AIDiagnosticsReport;
}
```

---

## Conclusion

This architecture delivers a privacy-first, performant AI system that enhances Locanote without compromising user data. By leveraging 2026's on-device AI capabilities, we provide intelligent features that feel magical while keeping everything local.

**Key Principles:**

1. Privacy by Design - No cloud dependencies
2. Progressive Enhancement - Works on all devices
3. Battery Awareness - Respects device constraints
4. User Control - Toggle any feature
5. Transparency - Clear confidence indicators

---

_Last Updated: February 2026_
_Version: 1.0_

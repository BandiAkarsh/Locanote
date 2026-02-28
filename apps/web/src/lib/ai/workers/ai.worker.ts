/**
 * AI Web Worker
 *
 * Runs AI inference in a separate thread to keep UI responsive
 */

import type {
  AITaskRequest,
  AITaskResult,
  AIProgress,
  AIFeature,
  PowerMode,
} from "../types.js";
import { hardwareDetector } from "../hardware.js";
import { selectModelForTask, getModel, DEFAULT_MODELS } from "../models.js";

// Worker state
let isInitialized = false;
const loadedModels = new Map<string, unknown>();
const activeTasks = new Map<string, AbortController>();
const enabledFeatures = new Set<AIFeature>([
  "auto-tagging",
  "semantic-search",
  "summarization",
  "writing-assistant",
  "smart-links",
]);
let powerMode: PowerMode = "balanced";

// Message handler
self.onmessage = async (event) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case "init":
        await initialize();
        postMessage({ type: "init-complete", id });
        break;

      case "execute":
        const result = await executeTask(payload as AITaskRequest);
        postMessage({ type: "result", taskId: payload.id, payload: result });
        break;

      case "cancel":
        cancelTask(payload.taskId);
        postMessage({ type: "cancelled", id });
        break;

      case "set-feature":
        setFeatureEnabled(payload.feature, payload.enabled);
        postMessage({ type: "feature-state", payload });
        break;

      case "set-power-mode":
        powerMode = payload.mode;
        postMessage({ type: "power-mode-set", id });
        break;

      default:
        postMessage({ type: "error", id, error: "Unknown message type" });
    }
  } catch (error) {
    postMessage({
      type: "error",
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

async function initialize(): Promise<void> {
  if (isInitialized) return;

  // Detect hardware capabilities
  const capabilities = await hardwareDetector.detect();
  console.log("[AI Worker] Hardware capabilities:", capabilities);

  // Pre-load lightweight models that are always needed
  if (capabilities.deviceTier !== "low") {
    // Pre-load embedding model for search
    await loadModelIfNeeded(DEFAULT_MODELS["embedding-generation"]);
  }

  isInitialized = true;
}

async function executeTask(request: AITaskRequest): Promise<AITaskResult> {
  const startTime = performance.now();

  try {
    // Check if feature is enabled
    const feature = taskToFeature(request.type);
    if (feature && !enabledFeatures.has(feature)) {
      return {
        taskId: request.id,
        success: false,
        error: {
          code: "FEATURE_DISABLED",
          message: `Feature ${feature} is disabled`,
          recoverable: false,
        },
        processingTime: 0,
      };
    }

    // Create abort controller for cancellation
    const controller = new AbortController();
    activeTasks.set(request.id, controller);

    // Report progress
    reportProgress(request.id, {
      taskId: request.id,
      stage: "processing",
      progress: 0,
      message: "Starting task...",
    });

    // Execute based on task type
    let result: unknown;

    switch (request.type) {
      case "tag-suggestion":
        result = await suggestTags(
          request.input as { content: string; existingTags: string[] },
        );
        break;

      case "embedding-generation":
        result = await generateEmbedding(request.input as { text: string });
        break;

      case "summarize":
        result = await summarize(
          request.input as { content: string; style: string },
        );
        break;

      case "grammar-check":
        result = await checkGrammar(request.input as { text: string });
        break;

      case "completion":
        result = await generateCompletion(
          request.input as { text: string; cursor: number },
        );
        break;

      case "classification":
        result = await classify(
          request.input as { text: string; labels: string[] },
        );
        break;

      default:
        throw new Error(`Unknown task type: ${request.type}`);
    }

    activeTasks.delete(request.id);

    return {
      taskId: request.id,
      success: true,
      data: result,
      processingTime: performance.now() - startTime,
    };
  } catch (error) {
    activeTasks.delete(request.id);

    return {
      taskId: request.id,
      success: false,
      error: {
        code: "EXECUTION_ERROR",
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
      },
      processingTime: performance.now() - startTime,
    };
  }
}

function cancelTask(taskId: string): void {
  const controller = activeTasks.get(taskId);
  if (controller) {
    controller.abort();
    activeTasks.delete(taskId);
  }
}

function setFeatureEnabled(feature: AIFeature, enabled: boolean): void {
  if (enabled) {
    enabledFeatures.add(feature);
  } else {
    enabledFeatures.delete(feature);
  }
}

function taskToFeature(task: string): AIFeature | null {
  const mapping: Record<string, AIFeature> = {
    "tag-suggestion": "auto-tagging",
    "embedding-generation": "semantic-search",
    summarize: "summarization",
    "grammar-check": "writing-assistant",
    completion: "writing-assistant",
    classification: "auto-tagging",
  };
  return mapping[task] || null;
}

function reportProgress(taskId: string, progress: AIProgress): void {
  postMessage({ type: "progress", taskId, payload: progress });
}

async function loadModelIfNeeded(modelId: string): Promise<unknown> {
  if (loadedModels.has(modelId)) {
    return loadedModels.get(modelId);
  }

  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  // In real implementation, load from Transformers.js or WebLLM
  // For now, return a placeholder
  const instance = { loaded: true, model };
  loadedModels.set(modelId, instance);

  return instance;
}

// Feature implementations (placeholders for actual model inference)
async function suggestTags(input: {
  content: string;
  existingTags: string[];
}): Promise<unknown> {
  // Load classification model
  await loadModelIfNeeded(DEFAULT_MODELS["classification"]);

  // Placeholder implementation
  const mockTags = ["work", "personal", "ideas", "meeting", "project"]
    .filter(() => Math.random() > 0.5)
    .map((tag) => ({
      tag,
      confidence: 0.6 + Math.random() * 0.35,
      isNew: !input.existingTags.includes(tag),
      reason: `Detected keywords related to ${tag}`,
    }));

  return mockTags;
}

async function generateEmbedding(input: { text: string }): Promise<unknown> {
  await loadModelIfNeeded(DEFAULT_MODELS["embedding-generation"]);

  // Placeholder: return random embedding vector
  const dimensions = 384; // MiniLM-L6
  return new Float32Array(dimensions).map(() => (Math.random() - 0.5) * 2);
}

async function summarize(input: {
  content: string;
  style: string;
}): Promise<unknown> {
  await loadModelIfNeeded(DEFAULT_MODELS["summarize"]);

  // Placeholder
  return {
    summary: `Summary (${input.style}): ${input.content.slice(0, 100)}...`,
    keyPoints: ["Point 1", "Point 2", "Point 3"],
    wordCount: 50,
  };
}

async function checkGrammar(input: { text: string }): Promise<unknown> {
  await loadModelIfNeeded(DEFAULT_MODELS["grammar-check"]);

  // Placeholder
  return [];
}

async function generateCompletion(input: {
  text: string;
  cursor: number;
}): Promise<unknown> {
  // Would use WebLLM for this
  return {
    text: " is a great way to organize your thoughts",
    confidence: 0.85,
  };
}

async function classify(input: {
  text: string;
  labels: string[];
}): Promise<unknown> {
  await loadModelIfNeeded(DEFAULT_MODELS["classification"]);

  // Placeholder: random classification
  const scores = input.labels.map((label) => ({
    label,
    score: Math.random(),
  }));
  scores.sort((a, b) => b.score - a.score);

  return {
    label: scores[0].label,
    score: scores[0].score,
    allLabels: scores,
  };
}

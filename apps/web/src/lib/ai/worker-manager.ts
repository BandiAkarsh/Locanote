/**
 * AI Worker Communication
 *
 * Manages communication with the AI Web Worker
 */

import type {
  AITaskRequest,
  AITaskResult,
  AIProgress,
  AIFeature,
} from "./types.js";

type ProgressCallback = (progress: AIProgress) => void;
type ResultCallback = (result: AITaskResult) => void;

class AIWorkerManager {
  private worker: Worker | null = null;
  private messageCallbacks = new Map<
    string,
    {
      onProgress?: ProgressCallback;
      onComplete: ResultCallback;
    }
  >();
  private featureCallbacks = new Map<
    AIFeature,
    Set<(enabled: boolean) => void>
  >();
  private _isInitialized = false;

  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    // Create worker
    this.worker = new Worker(
      new URL("./workers/ai.worker.ts", import.meta.url),
      { type: "module" },
    );

    this.worker.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.worker.onerror = (error) => {
      console.error("AI Worker error:", error);
    };

    // Wait for worker to be ready
    await this.sendMessage({ type: "init" });
    this._isInitialized = true;
  }

  private sendMessage(message: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const id = crypto.randomUUID();
      const timeout = setTimeout(() => {
        reject(new Error("Worker message timeout"));
      }, 30000);

      const handler = (event: MessageEvent) => {
        if (event.data.id === id) {
          clearTimeout(timeout);
          this.worker?.removeEventListener("message", handler);
          resolve(event.data);
        }
      };

      this.worker.addEventListener("message", handler);
      this.worker.postMessage({ ...(message as object), id });
    });
  }

  private handleMessage(data: unknown): void {
    if (typeof data !== "object" || data === null) return;

    const message = data as {
      type: string;
      taskId?: string;
      payload?: unknown;
    };

    if (message.type === "progress" && message.taskId) {
      const callbacks = this.messageCallbacks.get(message.taskId);
      if (callbacks?.onProgress) {
        callbacks.onProgress(message.payload as AIProgress);
      }
    } else if (message.type === "result" && message.taskId) {
      const callbacks = this.messageCallbacks.get(message.taskId);
      if (callbacks) {
        callbacks.onComplete(message.payload as AITaskResult);
        this.messageCallbacks.delete(message.taskId);
      }
    } else if (message.type === "feature-state") {
      const payload = message.payload as {
        feature: AIFeature;
        enabled: boolean;
      };
      const callbacks = this.featureCallbacks.get(payload.feature);
      callbacks?.forEach((cb) => cb(payload.enabled));
    }
  }

  async executeTask(
    request: Omit<AITaskRequest, "id" | "timestamp">,
    onProgress?: ProgressCallback,
  ): Promise<AITaskResult> {
    if (!this._isInitialized) {
      await this.initialize();
    }

    const taskId = crypto.randomUUID();
    const fullRequest: AITaskRequest = {
      ...request,
      id: taskId,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(taskId);
        reject(new Error("Task timeout"));
      }, 120000); // 2 minute timeout

      this.messageCallbacks.set(taskId, {
        onProgress,
        onComplete: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
      });

      this.worker?.postMessage({
        type: "execute",
        payload: fullRequest,
      });
    });
  }

  setFeatureEnabled(feature: AIFeature, enabled: boolean): void {
    this.worker?.postMessage({
      type: "set-feature",
      payload: { feature, enabled },
    });
  }

  onFeatureStateChange(
    feature: AIFeature,
    callback: (enabled: boolean) => void,
  ): () => void {
    if (!this.featureCallbacks.has(feature)) {
      this.featureCallbacks.set(feature, new Set());
    }
    this.featureCallbacks.get(feature)!.add(callback);

    return () => {
      this.featureCallbacks.get(feature)?.delete(callback);
    };
  }

  setPowerMode(mode: "performance" | "balanced" | "efficiency"): void {
    this.worker?.postMessage({
      type: "set-power-mode",
      payload: { mode },
    });
  }

  cancelTask(taskId: string): void {
    this.worker?.postMessage({
      type: "cancel",
      payload: { taskId },
    });
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this._isInitialized = false;
    this.messageCallbacks.clear();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}

// Singleton instance
export const aiWorker = new AIWorkerManager();

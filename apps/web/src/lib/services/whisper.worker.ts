import { pipeline, env } from "@xenova/transformers";

/**
 * WHISPER AI WORKER (v2 - Real-Time Streaming)
 * Handles heavy lifting of speech-to-text on a background thread.
 */

// Configure Transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const progress_callback = (data: any) => {
  self.postMessage({
    status: "progress",
    ...data,
  });
};

let transcriber: any = null;

async function loadModel() {
  self.postMessage({
    status: "loading",
    message: "Initializing Neural Engine...",
  });

  try {
    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en",
      {
        quantized: true,
        progress_callback,
      },
    );

    self.postMessage({ status: "ready" });
    console.log("[Worker] Whisper Engine ready");
  } catch (error: any) {
    console.error("[Worker] Model load failed:", error);
    self.postMessage({ status: "error", error: error.message });
  }
}

self.onmessage = async (event) => {
  const { type, audio, isInterim } = event.data;

  if (type === "load") {
    await loadModel();
  } else if (type === "transcribe") {
    if (!transcriber) {
      self.postMessage({ status: "error", error: "Neural engine not loaded" });
      return;
    }

    try {
      // Whisper transcription
      const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: "english",
        task: "transcribe",
        return_timestamps: false,
      });

      self.postMessage({
        status: "result",
        text: output.text,
        isInterim: isInterim || false,
      });
    } catch (error: any) {
      // Silently handle interim errors to prevent loop interruption
      if (!isInterim) {
        console.error("[Worker] Transcription failed:", error);
        self.postMessage({ status: "error", error: error.message });
      }
    }
  }
};

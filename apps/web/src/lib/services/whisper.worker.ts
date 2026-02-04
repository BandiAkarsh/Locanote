import { pipeline, env } from '@xenova/transformers';

/**
 * WHISPER AI WORKER
 * Handles heavy lifting of speech-to-text on a background thread.
 * Ensures the main UI thread stays at 60fps.
 */

// Configure Transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true; // Use Cache API for persistent offline model storage

// Progress callback for UI feedback
const progress_callback = (data: any) => {
    self.postMessage({
        status: 'progress',
        ...data
    });
};

let transcriber: any = null;

/**
 * Load the model from Xenova (OpenAI Whisper Tiny)
 * Approx 30MB in q4 format
 */
async function loadModel() {
    self.postMessage({ status: 'loading', message: 'Initializing Neural Engine...' });
    
    try {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
            quantized: true, // Use 4-bit/8-bit quantization for speed and size
            progress_callback,
        });
        
        self.postMessage({ status: 'ready' });
        console.log('[Worker] Whisper Engine ready');
    } catch (error: any) {
        console.error('[Worker] Model load failed:', error);
        self.postMessage({ status: 'error', error: error.message });
    }
}

/**
 * Handle incoming messages from the main thread
 */
self.onmessage = async (event) => {
    const { type, audio } = event.data;

    if (type === 'load') {
        await loadModel();
    } else if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ status: 'error', error: 'Neural engine not loaded' });
            return;
        }

        try {
            console.log('[Worker] Transcribing audio buffer...');
            
            const output = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
                return_timestamps: false
            });

            console.log('[Worker] Result:', output.text);

            self.postMessage({
                status: 'result',
                text: output.text
            });
        } catch (error: any) {
            console.error('[Worker] Transcription failed:', error);
            self.postMessage({ status: 'error', error: error.message });
        }
    }
};

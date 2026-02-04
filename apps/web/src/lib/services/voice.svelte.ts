// ============================================================================
// OFFLINE VOICE SERVICE (voice.svelte.ts)
// ============================================================================
// Manages the Whisper AI worker and microphone recording for 100% offline dictation.

import { isBrowser } from "$utils/browser";

export type VoiceStatus = 'idle' | 'loading' | 'ready' | 'listening' | 'processing' | 'error';

class VoiceService {
  status = $state<VoiceStatus>('idle');
  progress = $state(0);
  error = $state<string | null>(null);
  
  private worker: Worker | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private input: AudioNode | null = null;
  private _chunks: Float32Array[] = [];

  constructor() {
    if (isBrowser) {
      this.initWorker();
    }
  }

  /**
   * Initialize the Web Worker for background AI processing
   */
  private initWorker() {
    try {
      // Create worker using Vite's URL constructor pattern
      this.worker = new Worker(new URL('./whisper.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { status, progress, message, error, text } = event.data;

        if (status === 'progress') {
          this.progress = progress;
        } else if (status === 'loading') {
          this.status = 'loading';
        } else if (status === 'ready') {
          this.status = 'ready';
          console.log('[VoiceService] Neural Engine is ready (Offline)');
        } else if (status === 'error') {
          this.status = 'error';
          this.error = error;
          console.error('[VoiceService] AI Error:', error);
        } else if (status === 'result') {
          this.status = 'ready';
          this.handleResult(text);
        }
      };
    } catch (err) {
      console.error('[VoiceService] Failed to init AI worker:', err);
      this.status = 'error';
    }
  }

  /**
   * Load the AI model (approx 30MB q4 tiny)
   */
  async loadModel() {
    if (this.status !== 'idle' && this.status !== 'error') return;
    this.worker?.postMessage({ type: 'load' });
  }

  /**
   * Start recording audio for transcription
   */
  async startListening() {
    if (this.status === 'idle') {
      await this.loadModel();
      return;
    }

    if (this.status !== 'ready') return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // Whisper expects 16kHz
      });

      this.input = this.audioContext.createMediaStreamSource(this.stream);
      // ScriptProcessor is old but reliable for this specific raw audio capture in browsers
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this._chunks = [];

      this.processor.onaudioprocess = (e) => {
        if (this.status !== 'listening') return;
        const inputData = e.inputBuffer.getChannelData(0);
        this._chunks.push(new Float32Array(inputData));
      };

      this.input.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.status = 'listening';
      console.log('[VoiceService] AI is listening...');
    } catch (err: any) {
      console.error('[VoiceService] Mic access failed:', err);
      this.status = 'error';
      this.error = err.message;
    }
  }

  /**
   * Stop recording and trigger AI transcription
   */
  async stopListening() {
    if (this.status !== 'listening') return;

    this.status = 'processing';
    console.log('[VoiceService] AI is transcribing...');

    // Combine chunks into single Float32Array
    const length = this._chunks.reduce((acc, curr) => acc + curr.length, 0);
    const audio = new Float32Array(length);
    let offset = 0;
    for (const chunk of this._chunks) {
      audio.set(chunk, offset);
      offset += chunk.length;
    }

    // Send audio buffer to the background AI worker
    this.worker?.postMessage({ type: 'transcribe', audio });

    this.cleanupAudio();
  }

  private cleanupAudio() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.processor?.disconnect();
    this.input?.disconnect();
    this.audioContext?.close();
    
    this.stream = null;
    this.processor = null;
    this.input = null;
    this.audioContext = null;
  }

  /**
   * Callback for UI to receive the final transcribed text
   */
  onResult: ((text: string) => void) | null = null;

  private handleResult(text: string) {
    if (this.onResult && text.trim()) {
      this.onResult(text.trim());
    }
  }
}

export const voice = new VoiceService();

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
  private _intervalId: any = null;
  private _isManualStop = false;

  constructor() {
    if (isBrowser) {
      this.initWorker();
    }
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('./whisper.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { status, progress, message, error, text, isInterim } = event.data;

        if (status === 'progress') {
          this.progress = progress;
        } else if (status === 'loading') {
          this.status = 'loading';
        } else if (status === 'ready') {
          if (this.status === 'loading') this.status = 'ready';
        } else if (status === 'error') {
          this.status = 'error';
          this.error = error;
        } else if (status === 'result') {
          this.handleResult(text, isInterim);
          if (!isInterim && this._isManualStop) {
            this.status = 'ready';
          }
        }
      };
    } catch (err) {
      this.status = 'error';
    }
  }

  async loadModel() {
    if (this.status !== 'idle' && this.status !== 'error') return;
    this.worker?.postMessage({ type: 'load' });
  }

  async startListening() {
    if (this.status === 'idle') {
      await this.loadModel();
      return;
    }

    if (this.status !== 'ready') return;
    this._isManualStop = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.input = this.audioContext.createMediaStreamSource(this.stream);
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
      
      // Real-time loop: Transcribe the current buffer every 3 seconds
      this._intervalId = setInterval(() => {
        if (this.status === 'listening' && this._chunks.length > 0) {
          const audio = this.getAudioBuffer();
          this.worker?.postMessage({ type: 'transcribe', audio, isInterim: true });
        }
      }, 3500);

    } catch (err: any) {
      this.status = 'error';
      this.error = err.message;
    }
  }

  private getAudioBuffer(): Float32Array {
    const length = this._chunks.reduce((acc, curr) => acc + curr.length, 0);
    const audio = new Float32Array(length);
    let offset = 0;
    for (const chunk of this._chunks) {
      audio.set(chunk, offset);
      offset += chunk.length;
    }
    return audio;
  }

  async stopListening() {
    if (this.status !== 'listening') return;

    this._isManualStop = true;
    if (this._intervalId) clearInterval(this._intervalId);
    this.status = 'processing';

    const audio = this.getAudioBuffer();
    this.worker?.postMessage({ type: 'transcribe', audio, isInterim: false });

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

  onResult: ((text: string, isInterim: boolean) => void) | null = null;

  private handleResult(text: string, isInterim: boolean) {
    if (this.onResult) {
      this.onResult(text.trim(), isInterim);
    }
  }
}

export const voice = new VoiceService();

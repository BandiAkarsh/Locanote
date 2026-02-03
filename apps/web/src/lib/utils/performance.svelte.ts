// ============================================================================
// PERFORMANCE SCOUT (performance.svelte.ts)
// ============================================================================
// Detects hardware capabilities to scale visual fidelity (Nebula vs Aura).

import { isBrowser } from "./browser";

export type PerformanceTier = 'low' | 'medium' | 'high';

class PerformanceScout {
  tier = $state<PerformanceTier>('medium');
  fps = $state(60);
  hasWebGPU = $state(false);

  constructor() {
    if (isBrowser) {
      this.detectCapabilities();
      this.monitorFPS();
    }
  }

  /**
   * Detect hardware features
   */
  async detectCapabilities() {
    if (!isBrowser) return;

    // Check for WebGPU
    if ('gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        this.hasWebGPU = !!adapter;
        if (this.hasWebGPU) this.tier = 'high';
      } catch (e) {
        this.hasWebGPU = false;
      }
    }

    // Check device memory (if supported)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory <= 4) {
      this.tier = 'low';
    }

    // Check CPU cores
    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 4 && this.tier !== 'high') {
      this.tier = 'low';
    }

    console.log(`[PerformanceScout] Initial Tier: ${this.tier} (GPU: ${this.hasWebGPU}, Memory: ${memory}GB, Cores: ${cores})`);
  }

  /**
   * Continuous FPS monitoring to downgrade tier if needed
   */
  monitorFPS() {
    if (!isBrowser) return;

    let frames = 0;
    let lastTime = performance.now();

    const check = () => {
      frames++;
      const now = performance.now();
      
      if (now >= lastTime + 1000) {
        this.fps = Math.round((frames * 1000) / (now - lastTime));
        
        // Auto-downgrade if FPS is consistently low
        if (this.fps < 30 && this.tier !== 'low') {
          console.warn(`[PerformanceScout] Low FPS detected (${this.fps}). Downgrading visual tier.`);
          this.tier = 'low';
        }
        
        frames = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }
}

export const performanceScout = new PerformanceScout();

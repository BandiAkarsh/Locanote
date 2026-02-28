/**
 * Hardware Capability Detector
 *
 * Detects device capabilities for optimal AI model selection
 */

import type { HardwareCapabilities, BatteryInfo } from "./types.js";

export class HardwareDetector {
  private capabilities: HardwareCapabilities | null = null;
  private batteryManager: {
    charging: boolean;
    level: number;
    dischargingTime?: number;
    chargingTime?: number;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  } | null = null;

  async detect(): Promise<HardwareCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const [webgpu, webnn, gpuMemory, batteryInfo] = await Promise.all([
      this.detectWebGPU(),
      this.detectWebNN(),
      this.detectGPUMemory(),
      this.getBatteryInfo(),
    ]);

    const deviceTier = this.calculateDeviceTier(
      webgpu,
      gpuMemory,
      navigator.hardwareConcurrency,
    );

    this.capabilities = {
      webgpu,
      webnn,
      gpuMemory,
      cpuCores: navigator.hardwareConcurrency || 4,
      isBatteryPowered: !batteryInfo.charging,
      batteryLevel: batteryInfo.level,
      deviceTier,
    };

    return this.capabilities;
  }

  private async detectWebGPU(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;

    try {
      // @ts-ignore - WebGPU types may not be available
      const adapter = await navigator.gpu?.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }

  private async detectWebNN(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;

    try {
      // @ts-ignore - WebNN is experimental
      return "ml" in navigator && !!navigator.ml;
    } catch {
      return false;
    }
  }

  private async detectGPUMemory(): Promise<number> {
    try {
      // @ts-ignore
      const adapter = await navigator.gpu?.requestAdapter();
      if (adapter) {
        // @ts-ignore
        const info = await adapter.requestAdapterInfo();
        // Try to estimate memory from device name or use defaults
        return this.estimateGPUMemory(info?.device || "");
      }
    } catch {
      // Fallback
    }
    return 0;
  }

  private estimateGPUMemory(deviceName: string): number {
    const name = deviceName.toLowerCase();

    // High-end GPUs
    if (name.includes("rtx 4090") || name.includes("rtx 4080")) return 24576;
    if (name.includes("rtx 4070")) return 12288;
    if (name.includes("rtx 4060")) return 8192;
    if (name.includes("rtx 3090") || name.includes("rtx 3080")) return 24576;
    if (name.includes("rtx 3070")) return 8192;
    if (name.includes("rtx 3060")) return 12288;

    // Apple Silicon
    if (name.includes("apple m3 max")) return 36864;
    if (name.includes("apple m3 pro")) return 18432;
    if (name.includes("apple m3")) return 10240;
    if (name.includes("apple m2 max")) return 36864;
    if (name.includes("apple m2 pro")) return 16384;
    if (name.includes("apple m2")) return 10240;
    if (name.includes("apple m1 max")) return 32768;
    if (name.includes("apple m1 pro")) return 16384;
    if (name.includes("apple m1")) return 8192;

    // Intel integrated
    if (name.includes("intel")) return 4096;

    // Default
    return 4096;
  }

  private async getBatteryInfo(): Promise<BatteryInfo> {
    try {
      // @ts-ignore - Battery API
      const battery = await navigator.getBattery?.();
      if (battery) {
        this.batteryManager = battery;
        return {
          charging: battery.charging,
          level: battery.level,
          dischargingTime: battery.dischargingTime,
          chargingTime: battery.chargingTime,
        };
      }
    } catch {
      // Battery API not available
    }

    return {
      charging: true,
      level: 1.0,
    };
  }

  private calculateDeviceTier(
    webgpu: boolean,
    gpuMemory: number,
    cpuCores: number,
  ): "high" | "medium" | "low" {
    if (!webgpu) return "low";
    if (gpuMemory >= 16384 && cpuCores >= 8) return "high";
    if (gpuMemory >= 4096 && cpuCores >= 4) return "medium";
    return "low";
  }

  async watchBattery(
    callback: (info: BatteryInfo) => void,
  ): Promise<() => void> {
    if (!this.batteryManager) {
      try {
        // @ts-ignore
        this.batteryManager = await navigator.getBattery?.();
      } catch {
        return () => {}; // No cleanup needed
      }
    }

    if (!this.batteryManager) {
      return () => {};
    }

    const handleChange = () => {
      callback({
        charging: this.batteryManager!.charging,
        level: this.batteryManager!.level,
        dischargingTime: this.batteryManager!.dischargingTime,
        chargingTime: this.batteryManager!.chargingTime,
      });
    };

    this.batteryManager.addEventListener("levelchange", handleChange);
    this.batteryManager.addEventListener("chargingchange", handleChange);

    return () => {
      this.batteryManager?.removeEventListener("levelchange", handleChange);
      this.batteryManager?.removeEventListener("chargingchange", handleChange);
    };
  }

  getCapabilities(): HardwareCapabilities | null {
    return this.capabilities;
  }
}

// Singleton instance
export const hardwareDetector = new HardwareDetector();

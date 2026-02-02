// ============================================================================
// NETWORK STATUS STORE
// ============================================================================
// Reactive store that tracks online/offline status and connection quality.
// Uses the browser's navigator.onLine API and connection events.
//
// USAGE:
// import { networkStatus } from '$stores/network.svelte';
//
// {#if !networkStatus.isOnline}
//   <OfflineBanner />
// {/if}
// ============================================================================

// Type declarations for browser globals
declare const navigator: Navigator & { onLine: boolean; connection?: any };

// Check if running in browser
const isBrowser =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).window !== "undefined";

// ============================================================================
// CREATE NETWORK STORE
// ============================================================================
function createNetworkStore() {
  // Reactive state - must be inside function
  let isOnline = $state(isBrowser ? navigator.onLine : true);
  let connectionType = $state("unknown");
  let isSlowConnection = $state(false);

  // Initialize on client-side only
  if (isBrowser) {
    const win = (globalThis as any).window;

    // Listen for online/offline events
    win.addEventListener("online", () => {
      isOnline = true;
      console.log("[Network] Back online");
    });

    win.addEventListener("offline", () => {
      isOnline = false;
      console.log("[Network] Gone offline");
    });

    // Check connection type (if supported)
    const nav = win.navigator;
    const connection = nav.connection;
    if (connection) {
      connectionType = connection.effectiveType || "unknown";
      isSlowConnection =
        connection.saveData || connection.effectiveType === "2g";

      connection.addEventListener("change", () => {
        connectionType = connection.effectiveType;
        isSlowConnection =
          connection.saveData || connection.effectiveType === "2g";
      });
    }
  }

  return {
    get isOnline() {
      return isOnline;
    },
    get connectionType() {
      return connectionType;
    },
    get isSlowConnection() {
      return isSlowConnection;
    },

    // Helper methods
    get statusText() {
      if (!isOnline) return "Offline";
      if (isSlowConnection) return "Slow Connection";
      return "Online";
    },

    get statusColor() {
      if (!isOnline) return "red";
      if (isSlowConnection) return "yellow";
      return "green";
    },
  };
}

// Export singleton instance
export const networkStatus = createNetworkStore();

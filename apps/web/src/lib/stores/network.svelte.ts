// ============================================================================
// NETWORK STATUS STORE
// ============================================================================
// Reactive store that tracks online/offline status, connection quality,
// and synchronization state.
// ============================================================================

import { isBrowser, getLocalStorage, getWindow } from "$utils/browser";

// Connection states
export type SyncStatus = "synced" | "syncing" | "offline" | "error";
export type PeerStatus = "searching" | "connected" | "offline";

function createNetworkStore() {
  // 1. Browser Connectivity
  let isOnline = $state(isBrowser ? navigator.onLine : true);
  let connectionType = $state("unknown");

  // 2. Synchronization State
  let lastSynced = $state<number | null>(null);
  let syncStatus = $state<SyncStatus>("synced");

  // 3. P2P Collaboration State
  let peerStatus = $state<PeerStatus>("offline");
  let peerCount = $state(0);
  let signalingConnected = $state(false);

  if (isBrowser) {
    const win = getWindow();

    win?.addEventListener("online", () => {
      isOnline = true;
      if (peerStatus === "offline") peerStatus = "searching";
    });

    win?.addEventListener("offline", () => {
      isOnline = false;
      peerStatus = "offline";
      syncStatus = "offline";
    });

    // Check connection type
    const nav = win?.navigator as any;
    const connection = nav?.connection;
    if (connection) {
      connectionType = connection.effectiveType || "unknown";
      connection.addEventListener("change", () => {
        connectionType = connection.effectiveType;
      });
    }
  }

  return {
    // Getters
    get isOnline() {
      return isOnline;
    },
    get connectionType() {
      return connectionType;
    },
    get lastSynced() {
      return lastSynced;
    },
    get syncStatus() {
      return syncStatus;
    },
    get peerStatus() {
      return peerStatus;
    },
    get peerCount() {
      return peerCount;
    },
    get signalingConnected() {
      return signalingConnected;
    },

    // Setters (Internal use)
    setSyncStatus(status: SyncStatus) {
      syncStatus = status;
      if (status === "synced") lastSynced = Date.now();
    },

    updatePeerState(connected: boolean, count: number, signaling: boolean) {
      signalingConnected = signaling;
      peerCount = count;

      if (!isOnline) {
        peerStatus = "offline";
      } else if (count > 0) {
        peerStatus = "connected";
      } else if (signaling) {
        peerStatus = "searching";
      } else {
        peerStatus = "offline";
      }
    },

    // Formatted Helpers
    get statusMessage() {
      if (!isOnline) return "Working Offline";
      if (peerStatus === "connected")
        return `Collaborating (${peerCount} peer${peerCount > 1 ? "s" : ""})`;
      if (peerStatus === "searching") return "Searching for peers...";
      return "Online (Private Mode)";
    },
  };
}

export const networkStatus = createNetworkStore();

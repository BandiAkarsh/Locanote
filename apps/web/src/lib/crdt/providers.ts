// ============================================================================
// WEBRTC PROVIDER CONFIGURATION
// ============================================================================
// This module configures y-webrtc to enable peer-to-peer collaboration.
//
// WHAT IS WEBRTC?
// WebRTC (Web Real-time Communication) allows browsers to connect directly
// to each other without a server in the middle. Perfect for:
// - Real-time collaborative editing
// - Video/audio calls
// - File sharing
//
// HOW IT WORKS WITH YJS:
// 1. Multiple users have the same Yjs document open
// 2. Each user connects to the signaling server (to find other peers)
// 3. WebRTC establishes direct P2P connections between users
// 4. Yjs syncs document changes over these P2P connections
// 5. No central server sees the actual document content!
//
// SIGNALING SERVER ROLE:
// The signaling server ONLY helps peers find each other. Once connected,
// all data flows directly between browsers. The server never sees:
// - Document content
// - User edits
// - Any actual collaboration data
//
// SECURITY:
// - DTLS (Datagram TLS) encrypts all WebRTC data by default
// - Combined with my E2E encryption (Phase 5.1), data is double-encrypted
// - Even if signaling server is compromised, document content is safe
// ============================================================================

import { WebrtcProvider } from "y-webrtc"; // Import y-webrtc provider
import type * as Y from "yjs"; // Yjs types

// Re-export types
export type { WebrtcProvider };

// ============================================================================
// SIGNALING SERVER CONFIGURATION
// ============================================================================
// URL of my Cloudflare Worker signaling server
// Set VITE_SIGNALING_URL environment variable for production
// Falls back to localhost for development

const SIGNALING_SERVER_URL = (() => {
  // Check for production URL from environment
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_SIGNALING_URL
  ) {
    return import.meta.env.VITE_SIGNALING_URL;
  }

  // In development/test, always try to use local signaling if available
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    console.log(`[WebRTC] Detecting signaling server for host: ${host}`);
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.includes("local")
    ) {
      return "ws://127.0.0.1:8787";
    }
  }

  // Production signaling server
  return "wss://locanote-signaling.akarshbandi82.workers.dev";
})();

// ============================================================================
// CREATE WEBRTC PROVIDER
// ============================================================================
// This function creates a WebRTC provider for a Yjs document
//
// @param roomId - Unique room identifier (usually the note ID)
// @param ydoc - The Yjs document to sync
// @param user - User info for presence/awareness
// @returns WebrtcProvider instance

export function createWebRTCProvider(
  roomId: string, // Room/note identifier
  ydoc: Y.Doc, // Yjs document instance
  user: { name: string; color: string; id: string }, // Current user info
): WebrtcProvider {
  console.log(`[DEBUG] createWebRTCProvider called for room: ${roomId}`);

  // --------------------------------------------------------------------
  // CREATE PROVIDER
  // --------------------------------------------------------------------
  // WebrtcProvider connects to signaling server and manages P2P connections
  // 
  // FIX: Use noteId as room password so ALL users with same note can connect
  // The encryption key is separate and shared via URL hash for document content

  // Build signaling URL
  const signalingUrl = SIGNALING_SERVER_URL.includes("?")
    ? `${SIGNALING_SERVER_URL}&room=${roomId}`
    : `${SIGNALING_SERVER_URL}?room=${roomId}`;
  console.log(`[DEBUG] Connecting to signaling server:`, signalingUrl);
  console.log(`[DEBUG] Room password (noteId):`, roomId);
  
  const provider = new WebrtcProvider(
    roomId, // Room ID - peers in same room sync together
    ydoc, // Yjs document to synchronize
    {
      // ----------------------------------------------------------------
      // SIGNALING SERVERS
      // ----------------------------------------------------------------
      // Array of signaling server URLs
      // I use my Cloudflare Worker, appending the room ID for discovery
      signaling: [signalingUrl],

      // ----------------------------------------------------------------
      // ROOM PASSWORD
      // ----------------------------------------------------------------
      // CRITICAL FIX: Use noteId as password so all users with same note can connect
      // This ensures User A and User B join the same WebRTC room
      // The E2E encryption key is shared separately via URL hash
      password: roomId,
    },
  );
  
  console.log(`[DEBUG] WebRTC provider created for room: ${roomId}`);

  // --------------------------------------------------------------------
  // SET AWARENESS (USER PRESENCE)
  // --------------------------------------------------------------------
  // Set the current user's awareness state
  // This shows other users who you are and where your cursor is
  if (provider.awareness) {
    provider.awareness.setLocalState({
      user: {
        name: user.name,
        color: user.color,
        id: user.id,
      },
    });
  }

  // --------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------
  // Listen for connection state changes

  // When I connect to the signaling server
  provider.on("status", (event: { connected: boolean }) => {
    if (event.connected) {
      console.log(`[WebRTC] ✅ CONNECTED to signaling server for room: ${roomId}`);
    } else {
      console.log(`[WebRTC] ❌ Disconnected from signaling server for room: ${roomId}`);
    }
  });

  // When I discover new peers
  provider.on(
    "peers",
    (event: { webrtcPeers: string[]; bcPeers: string[] }) => {
      console.log(`[WebRTC] 👥 Peers in room ${roomId}:`, event.webrtcPeers.length, 'peers:', event.webrtcPeers);
    },
  );

  // When I sync with other peers
  provider.on("synced", (event: { synced: boolean }) => {
    if (event.synced) {
      console.log(`[WebRTC] Document synced with all peers in room ${roomId}`);
    }
  });

  return provider;
}

// ============================================================================
// DESTROY WEBRTC PROVIDER
// ============================================================================
// Properly cleanup and disconnect from WebRTC
//
// @param provider - The WebrtcProvider to destroy

export function destroyWebRTCProvider(provider: WebrtcProvider): void {
  // Disconnect from all peers
  provider.disconnect();

  // Destroy the provider (removes event listeners, etc.)
  provider.destroy();

  console.log("[WebRTC] Provider destroyed");
}

// ============================================================================
// GET CONNECTION STATUS
// ============================================================================
// Check if WebRTC provider is connected and has peers
//
// @param provider - The WebrtcProvider to check
// @returns Object with connection status

export function getWebRTCStatus(provider: WebrtcProvider): {
  connected: boolean;
  peerCount: number;
  signalingConnected: boolean;
} {
  // Get connected peers count
  // @ts-expect-error - accessing internal property
  const peerCount = provider.room?.connected?.size || 0;

  // Check if connected to signaling server
  // @ts-expect-error - accessing internal property
  const signalingConnected = provider.signalingConns?.size > 0;

  return {
    connected: provider.connected, // Whether I have P2P connections
    peerCount, // Number of connected peers
    signalingConnected, // Whether connected to signaling server
  };
}

// ============================================================================
// SET AWARENESS (USER PRESENCE)
// ============================================================================
// Update the current user's presence info
// This updates cursor position, selection, etc.
//
// @param provider - The WebrtcProvider
// @param state - New awareness state

export function setAwareness(
  provider: WebrtcProvider,
  state: { user: { name: string; color: string; id: string } },
): void {
  if (provider.awareness) {
    provider.awareness.setLocalState(state);
  }
}

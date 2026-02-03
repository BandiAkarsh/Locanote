// ============================================================================
// WEBRTC PROVIDER CONFIGURATION
// ============================================================================
// This module configures y-webrtc to enable peer-to-peer collaboration.
//
// WHAT IS WEBRTC?
// WebRTC (Web Real-Time Communication) allows browsers to connect directly
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
import {
  generateRoomKey,
  storeRoomKey,
  getRoomKey,
  hasRoomKey,
  removeRoomKey,
  encryptBytes,
  decryptBytes,
  type EncryptedMessage,
} from "$crypto/e2e"; // E2E encryption utilities

// Re-export types
export type { WebrtcProvider, EncryptedMessage };

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

  // Fallback for SSR or production
  return "wss://locanote-signaling.your-subdomain.workers.dev";
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
  roomPassword?: string, // Optional room password for access control
  encryptionKey?: Uint8Array, // Optional pre-generated encryption key
): WebrtcProvider {
  // --------------------------------------------------------------------
  // INITIALIZE E2E ENCRYPTION KEY
  // --------------------------------------------------------------------
  // Generate or store encryption key for this room
  if (!hasRoomKey(roomId)) {
    if (encryptionKey) {
      // Use provided key
      storeRoomKey(roomId, encryptionKey);
      console.log(`[E2E] Using provided encryption key for room: ${roomId}`);
    } else {
      // Generate new random key
      const newKey = generateRoomKey();
      storeRoomKey(roomId, newKey);
      console.log(`[E2E] Generated new encryption key for room: ${roomId}`);
    }
  }

  // --------------------------------------------------------------------
  // CREATE PROVIDER
  // --------------------------------------------------------------------
  // WebrtcProvider connects to signaling server and manages P2P connections

  const provider = new WebrtcProvider(
    roomId, // Room ID - peers in same room sync together
    ydoc, // Yjs document to synchronize
    {
      // ----------------------------------------------------------------
      // SIGNALING SERVERS
      // ----------------------------------------------------------------
      // Array of signaling server URLs
      // I use my Cloudflare Worker, appending the room ID for discovery
      signaling: [
        SIGNALING_SERVER_URL.includes("?")
          ? `${SIGNALING_SERVER_URL}&room=${roomId}`
          : `${SIGNALING_SERVER_URL}?room=${roomId}`,
      ],

      // ----------------------------------------------------------------
      // ROOM PASSWORD (Optional)
      // ----------------------------------------------------------------
      // When set, only users with the same password can join the room
      // This provides basic access control (not encryption)
      password: roomPassword,
    },
  );

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
      console.log(`[WebRTC] Connected to signaling server for room: ${roomId}`);
    } else {
      console.log(`[WebRTC] Disconnected from signaling server`);
    }
  });

  // When I discover new peers
  provider.on(
    "peers",
    (event: { webrtcPeers: string[]; bcPeers: string[] }) => {
      console.log(`[WebRTC] Peers in room:`, event.webrtcPeers);
    },
  );

  // When I sync with other peers
  provider.on("synced", (event: { synced: boolean }) => {
    if (event.synced) {
      console.log(`[WebRTC] Document synced with all peers`);
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

// ============================================================================
// E2E ENCRYPTION KEY MANAGEMENT
// ============================================================================
// Re-export encryption functions for use by the application

export {
  generateRoomKey,
  storeRoomKey,
  getRoomKey,
  hasRoomKey,
  removeRoomKey,
  encryptBytes,
  decryptBytes,
  encryptMessage,
  decryptMessage,
  clearAllKeys,
} from "$crypto/e2e";

export type { RoomKey } from "$crypto/e2e";

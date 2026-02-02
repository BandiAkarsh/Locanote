// ============================================================================
// WEBRTC SIGNALING SERVER - Cloudflare Worker
// ============================================================================
// This server helps WebRTC peers discover and connect to each other.
//
// WHAT IT DOES:
// 1. Peers connect via WebSocket to a "room" (identified by room ID)
// 2. Server forwards signaling messages between peers in the same room
// 3. Once peers connect via WebRTC, this server is no longer needed
//
// MESSAGES FLOW:
// Peer A ---[join:room-123]---> Server
// Peer B ---[join:room-123]---> Server
// Server ---[peer-joined:B]---> Peer A
// Server ---[peer-joined:A]---> Peer B
// Peer A ---[offer]---> Server ---[offer]---> Peer B
// Peer B ---[answer]---> Server ---[answer]---> Peer A
// A <---[WebRTC P2P connection established]---> B
//
// SECURITY:
// - CORS headers restrict which domains can connect
// - Rooms are isolated - peers in room A can't see room B
// - No data persists - messages are forwarded, not stored
// ============================================================================

import { SignalingRoom } from "./room";

// Export the Durable Object class for Cloudflare
export { SignalingRoom };

// Environment interface
export interface Env {
  // @ts-expect-error - SignalingRoom doesn't have the branded type marker required by
  // @cloudflare/workers-types v4.x, but the class works correctly at runtime.
  SIGNALING_ROOMS: DurableObjectNamespace<SignalingRoom>;
  ROOM_METADATA: KVNamespace;
  ALLOWED_ORIGINS: string;
  MAX_PEERS_PER_ROOM: string;
  ROOM_TIMEOUT_MS: string;
}

// ============================================================================
// MAIN WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // --------------------------------------------------------------------
    // CORS HEADERS
    // --------------------------------------------------------------------
    // Allow requests from specific origins (set in wrangler.toml)
    const origin = request.headers.get("Origin") || "*";
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

    const corsHeaders = {
      "Access-Control-Allow-Origin":
        allowedOrigins.includes("*") || allowedOrigins.includes(origin)
          ? origin
          : allowedOrigins[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // --------------------------------------------------------------------
    // PARSE REQUEST URL
    // --------------------------------------------------------------------
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: Date.now(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    // --------------------------------------------------------------------
    // WEBSOCKET UPGRADE HANDLING
    // --------------------------------------------------------------------
    // Only WebSocket upgrade requests are valid for signaling
    const upgradeHeader = request.headers.get("Upgrade");

    if (upgradeHeader !== "websocket") {
      return new Response(
        JSON.stringify({ error: "Expected WebSocket upgrade" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    // --------------------------------------------------------------------
    // EXTRACT ROOM ID
    // --------------------------------------------------------------------
    // Room ID can be passed as:
    // - Query parameter: ?room=abc123
    // - Path parameter: /room/abc123
    // - Subprotocol: Sec-WebSocket-Protocol: abc123

    let roomId = url.searchParams.get("room");

    if (!roomId && path.startsWith("/room/")) {
      roomId = path.split("/")[2];
    }

    if (!roomId) {
      const protocolHeader = request.headers.get("Sec-WebSocket-Protocol");
      if (protocolHeader) {
        roomId = protocolHeader.split(",")[0].trim();
      }
    }

    if (!roomId) {
      return new Response(JSON.stringify({ error: "Room ID required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Validate room ID (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(roomId)) {
      return new Response(JSON.stringify({ error: "Invalid room ID format" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // --------------------------------------------------------------------
    // GET OR CREATE DURABLE OBJECT
    // --------------------------------------------------------------------
    // Each room is a Durable Object instance
    // This ensures room state persists even if the worker restarts

    const id = env.SIGNALING_ROOMS.idFromName(roomId);
    const room = env.SIGNALING_ROOMS.get(id);

    // --------------------------------------------------------------------
    // FORWARD REQUEST TO DURABLE OBJECT
    // --------------------------------------------------------------------
    // The Durable Object handles the actual WebSocket connection

    const response = await room.fetch(request);

    // Add CORS headers to the response
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

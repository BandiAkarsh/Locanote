// ============================================================================
// SIGNALING SERVER FOR CLOUDFLARE WORKERS
// ============================================================================
// Simple WebSocket signaling - works on free tier with in-memory storage
// ============================================================================

export interface Env {
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const upgrade = request.headers.get("Upgrade");

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle WebSocket upgrade
    if (upgrade === "websocket") {
      const roomId = url.searchParams.get("room") || "default";

      // Create WebSocket pair
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      // Accept the WebSocket
      server.accept();

      // Add to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)!.add({ ws: server, client });

      // Handle messages
      server.addEventListener("message", (event) => {
        const message = event.data;
        const room = rooms.get(roomId);
        if (!room) return;

        for (const peer of room) {
          if (peer.ws !== server && peer.ws.readyState === WebSocket.OPEN) {
            try {
              peer.ws.send(message);
            } catch (e) {
              // Ignore send errors
            }
          }
        }
      });

      // Handle close
      server.addEventListener("close", () => {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(peerMap.get(server));
          peerMap.delete(server);
          if (room.size === 0) {
            rooms.delete(roomId);
          }
        }
      });

      // Track peer
      peerMap.set(server, { ws: server, client });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("Locanote Signaling Server", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  },
};

// In-memory room storage
const rooms = new Map<string, Set<{ ws: WebSocket; client: WebSocket }>>();
const peerMap = new Map<WebSocket, { ws: WebSocket; client: WebSocket }>();

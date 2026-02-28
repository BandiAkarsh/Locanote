// ============================================================================
// SIMPLE SIGNALING SERVER (No Durable Objects)
// ============================================================================
// WebSocket signaling for WebRTC - works on free tier
// ============================================================================

export interface Env {
  ALLOWED_ORIGINS: string;
  SIGNALING_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle WebSocket upgrade
    const url = new URL(request.url);

    if (url.pathname === "/ws" || url.pathname.startsWith("/ws/")) {
      return handleWebSocket(request, env, url.pathname);
    }

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Locanote Signaling Server", { status: 200 });
  },
};

async function handleWebSocket(
  request: Request,
  env: Env,
  path: string,
): Promise<Response> {
  // Validate origin
  const origin = request.headers.get("Origin");
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || ["*"];

  if (
    origin &&
    !allowedOrigins.includes("*") &&
    !allowedOrigins.includes(origin)
  ) {
    return new Response("Origin not allowed", { status: 403 });
  }

  // Create WebSocket pair
  const { 0: client, 1: server } = new WebSocketPair();

  // Handle messages
  server.addEventListener("message", (event) => {
    // Broadcast to other clients in the same room
    const roomId = path.replace("/ws/", "");
    broadcast(roomId, event.data, server);
  });

  server.addEventListener("close", () => {
    // Clean up
  });

  server.accept();

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// Simple in-memory room storage
const rooms = new Map<string, Set<WebSocket>>();

function broadcast(roomId: string, data: any, sender: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const client of room) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

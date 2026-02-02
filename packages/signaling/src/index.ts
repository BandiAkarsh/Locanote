import { SignalingRoom } from "./room";

export { SignalingRoom };

export interface Env {
  SIGNALING_ROOMS: DurableObjectNamespace;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    // WebSocket only
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    // Extract Room ID from query param or protocol
    let roomId = url.searchParams.get("room");
    if (!roomId) {
      const protocol = request.headers.get("Sec-WebSocket-Protocol");
      if (protocol) roomId = protocol.split(",")[0].trim();
    }

    if (!roomId) roomId = "default";

    const id = env.SIGNALING_ROOMS.idFromName(roomId);
    const room = env.SIGNALING_ROOMS.get(id);

    return room.fetch(request);
  },
};

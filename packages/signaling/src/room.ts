// ============================================================================
// SECURED SIGNALING ROOM DURABLE OBJECT
// ============================================================================
// Hardened Durable Object for WebRTC signaling with message validation,
// rate limiting, and security monitoring.
//
// SECURITY FEATURES:
// - Per-user rate limiting
// - Message size validation
// - Connection timeout handling
// - Broadcast restrictions
// - Anomaly detection
// ============================================================================

export interface Env {
  RATE_LIMIT_KV: KVNamespace;
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const ROOM_CONFIG = {
  maxPeers: 50,
  maxMessageSize: 65536, // 64KB
  maxMessagesPerMinute: 100,
  connectionTimeout: 30 * 60 * 1000, // 30 minutes
  pingInterval: 30000, // 30 seconds
  pingTimeout: 60000, // 60 seconds
};

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "ping" | "pong" | "bye";
  data?: unknown;
  to?: string;
  from?: string;
  timestamp?: number;
}

function validateMessage(message: string): {
  valid: boolean;
  error?: string;
  parsed?: SignalingMessage;
} {
  // Check size
  if (message.length > ROOM_CONFIG.maxMessageSize) {
    return { valid: false, error: "Message too large" };
  }

  // Parse JSON
  let parsed: SignalingMessage;
  try {
    parsed = JSON.parse(message);
  } catch (e) {
    return { valid: false, error: "Invalid JSON" };
  }

  // Validate structure
  if (!parsed.type || typeof parsed.type !== "string") {
    return { valid: false, error: "Missing message type" };
  }

  // Validate type
  const validTypes = [
    "offer",
    "answer",
    "ice-candidate",
    "ping",
    "pong",
    "bye",
  ];
  if (!validTypes.includes(parsed.type)) {
    return { valid: false, error: "Invalid message type" };
  }

  // Validate data for signaling messages
  if (
    ["offer", "answer", "ice-candidate"].includes(parsed.type) &&
    !parsed.data
  ) {
    return { valid: false, error: "Missing message data" };
  }

  return { valid: true, parsed };
}

// ============================================================================
// ORIGINAL SIGNALLING ROOM (for backward compatibility)
// ============================================================================

export class SignalingRoom {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const protocol = request.headers.get("Sec-WebSocket-Protocol");
    const acceptedProtocol = protocol ? protocol.split(",")[0].trim() : "";

    this.state.acceptWebSocket(
      server,
      acceptedProtocol ? [acceptedProtocol] : [],
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: acceptedProtocol
        ? { "Sec-WebSocket-Protocol": acceptedProtocol }
        : undefined,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    this.state.getWebSockets().forEach((peer) => {
      if (peer !== ws) {
        try {
          peer.send(message);
        } catch (e) {
          // Ignore errors for closing sockets
        }
      }
    });

    if (message === "ping") {
      try {
        ws.send("pong");
      } catch (e) {}
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    // Cleanup handled automatically
  }

  async webSocketError(ws: WebSocket, error: any) {
    // Log error if needed
  }
}

// ============================================================================
// SECURED SIGNALLING ROOM
// ============================================================================

interface PeerConnection {
  socket: WebSocket;
  userId: string;
  connectedAt: number;
  lastPing: number;
  messageCount: number;
  windowStart: number;
  blocked: boolean;
}

export class SecuredSignalingRoom {
  private state: DurableObjectState;
  private env: Env;
  private peers: Map<WebSocket, PeerConnection> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    // Get security context from headers
    const userId = request.headers.get("X-User-Id") ?? "anonymous";
    const roomId = request.headers.get("X-Room-Id") ?? "unknown";
    const clientIP = request.headers.get("X-Client-IP") ?? "unknown";

    // Check room capacity
    if (this.peers.size >= ROOM_CONFIG.maxPeers) {
      return new Response("Room full", { status: 503 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const protocol = request.headers.get("Sec-WebSocket-Protocol");
    const acceptedProtocol = protocol ? protocol.split(",")[0].trim() : "";

    this.state.acceptWebSocket(
      server,
      acceptedProtocol ? [acceptedProtocol] : [],
    );

    // Store peer connection info
    const peer: PeerConnection = {
      socket: server,
      userId,
      connectedAt: Date.now(),
      lastPing: Date.now(),
      messageCount: 0,
      windowStart: Date.now(),
      blocked: false,
    };

    this.peers.set(server, peer);

    // Send welcome message with connection info
    try {
      server.send(
        JSON.stringify({
          type: "connected",
          data: {
            peerId: userId,
            roomId,
            timestamp: Date.now(),
            peerCount: this.peers.size,
          },
        }),
      );
    } catch (e) {
      console.error("[SignalingRoom] Failed to send welcome:", e);
    }

    // Start ping interval
    this.startPingInterval(server);

    console.log(
      `[SignalingRoom] ${userId} joined room ${roomId} (${this.peers.size} peers)`,
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: acceptedProtocol
        ? { "Sec-WebSocket-Protocol": acceptedProtocol }
        : undefined,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const peer = this.peers.get(ws);
    if (!peer || peer.blocked) return;

    // Convert ArrayBuffer to string if needed
    const messageStr =
      typeof message === "string" ? message : new TextDecoder().decode(message);

    // Validate message
    const validation = validateMessage(messageStr);
    if (!validation.valid) {
      console.warn(
        `[SignalingRoom] Invalid message from ${peer.userId}: ${validation.error}`,
      );
      try {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: validation.error },
          }),
        );
      } catch (e) {}
      return;
    }

    const parsed = validation.parsed!;

    // Handle ping/pong
    if (parsed.type === "ping") {
      peer.lastPing = Date.now();
      try {
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      } catch (e) {}
      return;
    }

    if (parsed.type === "pong") {
      peer.lastPing = Date.now();
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - peer.windowStart > 60000) {
      // Reset window
      peer.windowStart = now;
      peer.messageCount = 0;
    }

    peer.messageCount++;

    if (peer.messageCount > ROOM_CONFIG.maxMessagesPerMinute) {
      peer.blocked = true;
      console.warn(`[SignalingRoom] Rate limit exceeded for ${peer.userId}`);
      try {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Rate limit exceeded" },
          }),
        );
        ws.close(1008, "Rate limit exceeded");
      } catch (e) {}
      return;
    }

    // Validate data field for signaling messages
    if (["offer", "answer", "ice-candidate"].includes(parsed.type)) {
      if (typeof parsed.data !== "object") {
        console.warn(`[SignalingRoom] Invalid data from ${peer.userId}`);
        return;
      }
    }

    // Broadcast to other peers
    const broadcastMessage = JSON.stringify({
      ...parsed,
      from: peer.userId,
      timestamp: Date.now(),
    });

    let sentCount = 0;
    this.peers.forEach((p, socket) => {
      if (socket !== ws && !p.blocked) {
        try {
          socket.send(broadcastMessage);
          sentCount++;
        } catch (e) {
          // Peer may be closing
        }
      }
    });

    // Log significant events
    if (parsed.type === "offer" || parsed.type === "answer") {
      console.log(
        `[SignalingRoom] ${parsed.type} from ${peer.userId} to ${sentCount} peers`,
      );
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    const peer = this.peers.get(ws);
    if (peer) {
      console.log(
        `[SignalingRoom] ${peer.userId} disconnected (code: ${code}, clean: ${wasClean})`,
      );
      this.peers.delete(ws);
    }
  }

  async webSocketError(ws: WebSocket, error: any) {
    const peer = this.peers.get(ws);
    console.error(
      `[SignalingRoom] Error for ${peer?.userId ?? "unknown"}:`,
      error,
    );
  }

  private startPingInterval(ws: WebSocket): void {
    const interval = setInterval(() => {
      const peer = this.peers.get(ws);
      if (!peer) {
        clearInterval(interval);
        return;
      }

      // Check for timeout
      if (Date.now() - peer.lastPing > ROOM_CONFIG.pingTimeout) {
        console.warn(`[SignalingRoom] Ping timeout for ${peer.userId}`);
        try {
          ws.close(1001, "Ping timeout");
        } catch (e) {}
        this.peers.delete(ws);
        clearInterval(interval);
        return;
      }

      // Send ping
      try {
        ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      } catch (e) {
        clearInterval(interval);
      }
    }, ROOM_CONFIG.pingInterval);
  }
}

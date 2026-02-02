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
    // Pure broadcaster: send exactly what we received to everyone else in the room
    this.state.getWebSockets().forEach((peer) => {
      if (peer !== ws) {
        try {
          peer.send(message);
        } catch (e) {
          // Ignore errors for closing sockets
        }
      }
    });

    // Handle pings to keep connection alive
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
    // DO nothing, getWebSockets() will handle cleanup
  }

  async webSocketError(ws: WebSocket, error: any) {
    // DO nothing
  }
}

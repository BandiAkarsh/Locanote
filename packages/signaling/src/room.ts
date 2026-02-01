// ============================================================================
// SIGNALING ROOM DURABLE OBJECT
// ============================================================================
// Each room is a Durable Object that manages WebSocket connections for that room.
// Durable Objects maintain state even when the worker restarts.
//
// WHAT THIS DOES:
// 1. Accepts WebSocket connections from peers
// 2. Tracks which peers are in the room
// 3. Forwards signaling messages between peers (offers, answers, ICE candidates)
// 4. Handles peer disconnections and cleanup
// ============================================================================

// Peer connection info
interface Peer {
  id: string;                    // Unique peer ID (WebSocket ID)
  ws: WebSocket;                 // WebSocket connection
  joinedAt: number;              // When peer joined
  lastActivity: number;          // Last message timestamp
}

// Signaling message types
interface SignalingMessage {
  type: string;                  // Message type: offer, answer, ice-candidate, join, leave, ping, pong, peer-joined, peer-left, error, joined
  from?: string;                 // Sender peer ID
  to?: string;                   // Target peer ID (null = broadcast)
  data?: any;                    // Message payload
  timestamp?: number;            // Message timestamp
}

// SignalingRoom implements the DurableObject interface for Cloudflare Workers
// We add the brand marker to satisfy TypeScript's strict type checking in workers-types 4.x
export class SignalingRoom {
  // Brand marker required by @cloudflare/workers-types v4.x
  readonly [Rpc.__DURABLE_OBJECT_BRAND]: never = undefined as never;
  
  private peers: Map<string, Peer> = new Map();
  private roomId: string = '';
  private state: DurableObjectState;
  private maxPeers: number = 10;
  private roomTimeoutMs: number = 1800000; // 30 minutes
  private lastActivity: number = Date.now();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    
    // Get configuration from environment
    this.maxPeers = parseInt(env.MAX_PEERS_PER_ROOM || '10');
    this.roomTimeoutMs = parseInt(env.ROOM_TIMEOUT_MS || '1800000');
  }

  // ============================================================================
  // HTTP REQUEST HANDLER
  // ============================================================================

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.roomId = url.searchParams.get('room') || 'unknown';

    // Accept the WebSocket upgrade using WebSocketPair
    const webSocketPair = new WebSocketPair();
    const [clientWs, serverWs] = [webSocketPair[0], webSocketPair[1]];

    // Handle the WebSocket connection
    await this.handleConnection(serverWs);

    // Return the client WebSocket to the browser with proper ResponseInit for Workers
    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    } as ResponseInit);
  }

  // ============================================================================
  // WEBSOCKET CONNECTION HANDLER
  // ============================================================================

  private async handleConnection(ws: WebSocket): Promise<void> {
    // Generate unique peer ID
    const peerId = crypto.randomUUID();
    
    // Store peer info
    const peer: Peer = {
      id: peerId,
      ws: ws,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
    };

    // Check room capacity
    if (this.peers.size >= this.maxPeers) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Room is full' }
      }));
      ws.close(1008, 'Room is full');
      return;
    }

    // Add peer to room
    this.peers.set(peerId, peer);
    this.lastActivity = Date.now();

    // Notify other peers about new peer
    this.broadcast({
      type: 'peer-joined',
      from: peerId,
      data: { peerCount: this.peers.size }
    }, peerId);

    // Send peer their ID and current peer list
    ws.send(JSON.stringify({
      type: 'joined',
      data: {
        peerId: peerId,
        roomId: this.roomId,
        peers: Array.from(this.peers.keys()).filter(id => id !== peerId)
      }
    }));

    // Handle messages from this peer
    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data as string);
        message.from = peerId;
        message.timestamp = Date.now();
        
        peer.lastActivity = Date.now();
        this.lastActivity = Date.now();

        // Handle different message types
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
            
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            // Forward signaling messages to target peer
            if (message.to) {
              this.sendToPeer(message.to, message);
            } else {
              // Broadcast to all other peers
              this.broadcast(message, peerId);
            }
            break;
            
          default:
            console.log(`[Room ${this.roomId}] Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error(`[Room ${this.roomId}] Error handling message:`, error);
      }
    });

    // Handle disconnection
    ws.addEventListener('close', () => {
      this.handleDisconnection(peerId);
    });

    // Handle errors
    ws.addEventListener('error', (error: Event) => {
      console.error(`[Room ${this.roomId}] WebSocket error for peer ${peerId}:`, error);
      this.handleDisconnection(peerId);
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat(peerId);
  }

  // ============================================================================
  // SIGNALING MESSAGE HANDLING
  // ============================================================================

  private sendToPeer(peerId: string, message: SignalingMessage): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        peer.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`[Room ${this.roomId}] Failed to send message to peer ${peerId}:`, error);
        // Peer might be disconnected, remove them
        this.handleDisconnection(peerId);
      }
    }
  }

  private broadcast(message: SignalingMessage, excludePeerId?: string): void {
    this.peers.forEach((peer, peerId) => {
      if (peerId !== excludePeerId) {
        this.sendToPeer(peerId, message);
      }
    });
  }

  // ============================================================================
  // CONNECTION LIFECYCLE
  // ============================================================================

  private handleDisconnection(peerId: string): void {
    if (!this.peers.has(peerId)) return;

    // Remove peer
    this.peers.delete(peerId);
    this.lastActivity = Date.now();

    // Notify other peers
    this.broadcast({
      type: 'peer-left',
      from: peerId,
      data: { peerCount: this.peers.size }
    });

    console.log(`[Room ${this.roomId}] Peer ${peerId} disconnected. Room size: ${this.peers.size}`);

    // If room is empty, schedule cleanup
    if (this.peers.size === 0) {
      this.scheduleCleanup();
    }
  }

  private startHeartbeat(peerId: string): void {
    const interval = setInterval(() => {
      const peer = this.peers.get(peerId);
      if (!peer) {
        clearInterval(interval);
        return;
      }

      // Check if peer hasn't sent any message in 2 minutes
      const inactive = Date.now() - peer.lastActivity > 120000;
      if (inactive) {
        console.log(`[Room ${this.roomId}] Peer ${peerId} timed out due to inactivity`);
        peer.ws.close(1001, 'Inactive');
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  }

  private scheduleCleanup(): void {
    // Schedule hibernation after room timeout
    setTimeout(() => {
      if (this.peers.size === 0) {
        console.log(`[Room ${this.roomId}] Room empty, scheduling hibernation`);
        // The Durable Object will hibernate when all event handlers complete
      }
    }, this.roomTimeoutMs);
  }
}

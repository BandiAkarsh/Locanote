/// <reference types="@cloudflare/workers-types" />

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
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'ping' | 'pong';
  from?: string;                 // Sender peer ID
  to?: string;                   // Target peer ID (null = broadcast)
  data?: any;                    // Message payload
  timestamp?: number;            // Message timestamp
}

export class SignalingRoom implements DurableObject {
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
  // HANDLE NEW CONNECTION
  // ============================================================================

  private async handleConnection(ws: WebSocket): Promise<void> {
    // Accept the WebSocket
    ws.accept();

    // Generate unique peer ID
    const peerId = this.generatePeerId();

    // Check room capacity
    if (this.peers.size >= this.maxPeers) {
      this.sendToPeer(ws, {
        type: 'join',
        data: { error: 'Room is full', maxPeers: this.maxPeers }
      });
      ws.close(1008, 'Room full');
      return;
    }

    // Create peer object
    const peer: Peer = {
      id: peerId,
      ws: ws,
      joinedAt: Date.now(),
      lastActivity: Date.now()
    };

    // Store peer
    this.peers.set(peerId, peer);
    this.lastActivity = Date.now();

    // Notify new peer of successful join
    this.sendToPeer(ws, {
      type: 'join',
      data: { 
        peerId: peerId,
        roomId: this.roomId,
        peerCount: this.peers.size,
        message: 'Joined room successfully'
      }
    });

    // Notify existing peers about new peer
    this.broadcastToOthers(peerId, {
      type: 'join',
      from: peerId,
      data: { peerCount: this.peers.size }
    });

    // Send list of existing peers to new peer
    const existingPeers = Array.from(this.peers.keys()).filter(id => id !== peerId);
    if (existingPeers.length > 0) {
      this.sendToPeer(ws, {
        type: 'peers',
        data: { peers: existingPeers }
      });
    }

    // Handle incoming messages
    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data as string);
        this.handleMessage(peerId, message);
      } catch (error) {
        console.error('Failed to parse message:', error);
        this.sendToPeer(ws, {
          type: 'error',
          data: { message: 'Invalid message format' }
        });
      }
    });

    // Handle disconnection
    ws.addEventListener('close', () => {
      this.handleDisconnection(peerId);
    });

    // Handle errors
    ws.addEventListener('error', (error: ErrorEvent) => {
      console.error(`WebSocket error for peer ${peerId}:`, error);
      this.handleDisconnection(peerId);
    });

    // Start heartbeat to keep connection alive
    this.startHeartbeat(peerId);

    console.log(`Peer ${peerId} joined room ${this.roomId}. Total peers: ${this.peers.size}`);
  }

  // ============================================================================
  // HANDLE INCOMING MESSAGE
  // ============================================================================

  private handleMessage(fromPeerId: string, message: SignalingMessage): void {
    const peer = this.peers.get(fromPeerId);
    if (!peer) return;

    // Update activity timestamp
    peer.lastActivity = Date.now();
    this.lastActivity = Date.now();

    // Handle different message types
    switch (message.type) {
      case 'ping':
        // Respond with pong to keep connection alive
        this.sendToPeer(peer.ws, { type: 'pong', timestamp: Date.now() });
        break;

      case 'pong':
        // Client responded to our ping - connection is alive
        break;

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // Forward signaling message to target peer or broadcast
        if (message.to) {
          // Send to specific peer
          const targetPeer = this.peers.get(message.to);
          if (targetPeer) {
            this.sendToPeer(targetPeer.ws, {
              ...message,
              from: fromPeerId,
              timestamp: Date.now()
            });
          }
        } else {
          // Broadcast to all other peers
          this.broadcastToOthers(fromPeerId, {
            ...message,
            from: fromPeerId,
            timestamp: Date.now()
          });
        }
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  // ============================================================================
  // HANDLE PEER DISCONNECTION
  // ============================================================================

  private handleDisconnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Remove peer from room
    this.peers.delete(peerId);
    this.lastActivity = Date.now();

    // Notify other peers
    this.broadcastToOthers(peerId, {
      type: 'leave',
      from: peerId,
      data: { peerCount: this.peers.size }
    });

    console.log(`Peer ${peerId} left room ${this.roomId}. Remaining peers: ${this.peers.size}`);
  }

  // ============================================================================
  // SEND MESSAGE TO SPECIFIC PEER
  // ============================================================================

  private sendToPeer(ws: WebSocket, message: any): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  // ============================================================================
  // BROADCAST MESSAGE TO ALL PEERS EXCEPT SENDER
  // ============================================================================

  private broadcastToOthers(excludePeerId: string, message: any): void {
    this.peers.forEach((peer, peerId) => {
      if (peerId !== excludePeerId) {
        this.sendToPeer(peer.ws, message);
      }
    });
  }

  // ============================================================================
  // START HEARTBEAT (KEEP CONNECTION ALIVE)
  // ============================================================================

  private startHeartbeat(peerId: string): void {
    const interval = setInterval(() => {
      const peer = this.peers.get(peerId);
      if (!peer) {
        clearInterval(interval);
        return;
      }

      // Check if peer has been inactive for too long
      const inactiveTime = Date.now() - peer.lastActivity;
      if (inactiveTime > this.roomTimeoutMs) {
        console.log(`Peer ${peerId} timed out due to inactivity`);
        peer.ws.close(1001, 'Timeout');
        clearInterval(interval);
        return;
      }

      // Send ping
      this.sendToPeer(peer.ws, {
        type: 'ping',
        timestamp: Date.now()
      });
    }, 30000); // Send ping every 30 seconds
  }

  // ============================================================================
  // GENERATE UNIQUE PEER ID
  // ============================================================================

  private generatePeerId(): string {
    return `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

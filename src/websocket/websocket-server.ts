// src/websocket/websocket-server.ts
import * as http from 'http';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AI_MESSAGE = 'ai_message',
  USER_MESSAGE = 'user_message',
  PROVIDER_STATUS = 'provider_status',
  ERROR = 'error'
}

/**
 * WebSocket client connection
 */
interface WebSocketClient {
  id: string;
  sessionId: string;
  isAlive: boolean;
  ws: WebSocket;
}

/**
 * WebSocket server for real-time communication
 */
export class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the WebSocket server
   */
  initialize(server: http.Server): void {
    // Create WebSocket server
    this.wss = new WebSocket.Server({ server });
    
    // Handle connections
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Start ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.pingClients();
    }, 30000); // Ping every 30 seconds
    
    console.log('WebSocket server initialized');
  }

  /**
   * Handle a new WebSocket connection
   */
  handleConnection(ws: WebSocket, request: http.IncomingMessage): void {
    // Parse URL to get session ID
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const sessionId = url.searchParams.get('sessionId') || 'default';
    
    // Create client with ID
    const client: WebSocketClient = {
      id: Math.random().toString(36).substring(2, 15),
      sessionId: sessionId,
      isAlive: true,
      ws: ws
    };
    
    // Store client
    this.clients.set(client.id, client);
    
    console.log(`WebSocket client connected: ${client.id} (Session: ${sessionId})`);
    
    // Send welcome message
    this.sendToClient(client.id, {
      type: WebSocketMessageType.CONNECT,
      message: 'Connected to aiGM WebSocket server',
      clientId: client.id,
      sessionId: client.sessionId,
      timestamp: new Date().toISOString()
    });
    
    // Handle pong messages
    ws.on('pong', () => {
      client.isAlive = true;
    });
    
    // Handle messages
    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Emit message event
        this.emit('message', {
          clientId: client.id,
          sessionId: client.sessionId,
          message
        });
        
        // Handle different message types
        if (message.type === 'user_message') {
          this.broadcastToSession(sessionId, {
            type: WebSocketMessageType.USER_MESSAGE,
            clientId: client.id,
            message: message.content,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error instanceof Error ? error.message : String(error));
      }
    });
    
    // Handle close
    ws.on('close', () => {
      this.clients.delete(client.id);
      console.log(`WebSocket client disconnected: ${client.id}`);
      
      this.emit('disconnect', {
        clientId: client.id,
        sessionId: client.sessionId
      });
    });
    
    // Handle errors
    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for client ${client.id}:`, error instanceof Error ? error.message : String(error));
      
      this.emit('error', {
        clientId: client.id,
        sessionId: client.sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
    });
    
    // Emit connect event
    this.emit('connect', {
      clientId: client.id,
      sessionId: client.sessionId
    });
  }

  /**
   * Send a message to a specific client
   */
  sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast a message to all clients in a session
   */
  broadcastToSession(sessionId: string, message: any): void {
    for (const [id, client] of this.clients.entries()) {
      if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcastToAll(message: any): void {
    for (const [id, client] of this.clients.entries()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Ping all clients to keep connections alive
   */
  private pingClients(): void {
    for (const [id, client] of this.clients.entries()) {
      if (client.isAlive === false) {
        client.ws.terminate();
        this.clients.delete(id);
        console.log(`WebSocket client terminated (no pong): ${id}`);
        continue;
      }
      
      client.isAlive = false;
      client.ws.ping();
    }
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get the number of connected clients in a session
   */
  getSessionClientCount(sessionId: string): number {
    let count = 0;
    
    for (const [id, client] of this.clients.entries()) {
      if (client.sessionId === sessionId) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Shutdown the WebSocket server
   */
  shutdown(): void {
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Close all connections
    if (this.wss) {
      for (const [id, client] of this.clients.entries()) {
        client.ws.terminate();
      }
      
      this.clients.clear();
      
      this.wss.close();
      this.wss = null;
      
      console.log('WebSocket server shut down');
    }
  }
}

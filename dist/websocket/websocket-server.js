"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = exports.WebSocketMessageType = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
/**
 * WebSocket message types
 */
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["CONNECT"] = "connect";
    WebSocketMessageType["DISCONNECT"] = "disconnect";
    WebSocketMessageType["AI_MESSAGE"] = "ai_message";
    WebSocketMessageType["USER_MESSAGE"] = "user_message";
    WebSocketMessageType["PROVIDER_STATUS"] = "provider_status";
    WebSocketMessageType["ERROR"] = "error";
})(WebSocketMessageType || (exports.WebSocketMessageType = WebSocketMessageType = {}));
/**
 * WebSocket server for real-time communication
 */
class WebSocketServer extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.wss = null;
        this.clients = new Map();
        this.pingInterval = null;
    }
    /**
     * Initialize the WebSocket server
     */
    initialize(server) {
        // Create WebSocket server
        this.wss = new ws_1.default.Server({ server });
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
    handleConnection(ws, request) {
        // Parse URL to get session ID
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        const sessionId = url.searchParams.get('sessionId') || 'default';
        // Create client with ID
        const client = {
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
        ws.on('message', (data) => {
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
            }
            catch (error) {
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
        ws.on('error', (error) => {
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
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === ws_1.default.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    /**
     * Broadcast a message to all clients in a session
     */
    broadcastToSession(sessionId, message) {
        for (const [id, client] of this.clients.entries()) {
            if (client.sessionId === sessionId && client.ws.readyState === ws_1.default.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        }
    }
    /**
     * Broadcast a message to all connected clients
     */
    broadcastToAll(message) {
        for (const [id, client] of this.clients.entries()) {
            if (client.ws.readyState === ws_1.default.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        }
    }
    /**
     * Ping all clients to keep connections alive
     */
    pingClients() {
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
    getClientCount() {
        return this.clients.size;
    }
    /**
     * Get the number of connected clients in a session
     */
    getSessionClientCount(sessionId) {
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
    shutdown() {
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
exports.WebSocketServer = WebSocketServer;

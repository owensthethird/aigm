export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export type MessageType = 'message' | 'typing' | 'provider_status' | 'error' | 'system';

export interface WebSocketMessage {
  type: MessageType;
  payload?: any;
  data?: any; // For backward compatibility
  timestamp?: number;
}

export interface ProviderStatusUpdate {
  providerId: string;
  status: 'healthy' | 'unhealthy' | 'connecting' | 'disconnected';
}

type MessageListener = (message: WebSocketMessage) => void;
type StatusListener = (status: ConnectionStatus) => void;

/**
 * WebSocketService - Handles real-time communication with the AI backend
 * Uses native WebSocket API with automatic reconnection and event handling
 */
class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private messageListeners: MessageListener[] = [];
  private statusListeners: StatusListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private baseUrl = 'ws://localhost:3000'; // Default server URL (using WebSocket protocol)

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of WebSocketService
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize the WebSocket connection
   * @param url Server URL to connect to
   */
  public init(url: string = this.baseUrl): void {
    if (url) {
      // Ensure URL uses ws:// or wss:// protocol
      if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        this.baseUrl = `ws://${url.replace(/^https?:\/\//, '')}`;
      } else {
        this.baseUrl = url;
      }
    }
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    if (this.socket) {
      // If socket exists but is not open, close it first
      if (this.socket.readyState !== WebSocket.OPEN) {
        this.socket.close();
        this.socket = null;
      } else {
        return; // Already connected
      }
    }
    
    this.updateStatus('connecting');
    
    try {
      this.socket = new WebSocket(this.baseUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.updateStatus('error');
      this.attemptReconnect();
    }
  }

  /**
   * Setup native WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.updateStatus('connected');
      console.log('WebSocket connection established');
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      this.updateStatus('disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      this.updateStatus('error');
      // Error usually followed by close event which will trigger reconnect
    };

    // Handle all incoming messages through the onmessage handler
    this.socket.onmessage = (event: MessageEvent) => {
      try {
        // Try to parse as JSON
        const data = JSON.parse(event.data);
        
        // Handle as WebSocketMessage if it has the right format
        if (data && typeof data === 'object' && 'type' in data) {
          const message: WebSocketMessage = {
            type: data.type,
            payload: data.payload || data.data, // Support both formats
            timestamp: data.timestamp || Date.now()
          };
          
          this.handleMessage(message);
        } else {
          console.warn('Received message in unexpected format:', data);
          // Still notify with a generic message type
          this.handleMessage({
            type: 'message',
            payload: data,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Handle plain text or non-JSON data
        console.warn('Received non-JSON message:', event.data);
        this.handleMessage({
          type: 'message', 
          payload: event.data,
          timestamp: Date.now()
        });
      }
    };
  }

  /**
   * Handle incoming messages and notify subscribers
   */
  private handleMessage(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => listener(message));
  }

  /**
   * Update connection status and notify subscribers
   */
  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateStatus('error');
      return;
    }

    // Calculate backoff delay with jitter for distributed reconnection
    const jitter = Math.random() * 0.5 + 0.75; // Random between 0.75 and 1.25
    const delay = Math.min(this.reconnectDelay * jitter, 30000); // Cap at 30 seconds
    
    console.log(`Attempting to reconnect in ${Math.round(delay / 1000)}s`);
    
    // Increment for next attempt if needed
    this.reconnectAttempts++;
    this.reconnectDelay *= 1.5; // Exponential backoff
    
    setTimeout(() => {
      // For WebSocket, we need to create a new connection
      // Close existing socket if it's still there
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {
          // Ignore errors during close
        }
        this.socket = null;
      }
      // Create a new connection
      this.connect();
    }, delay);
  }

  /**
   * Send message to the server
   */
  public sendMessage(message: any): void {
    if (this.socket && this.status === 'connected') {
      try {
        // Convert message to JSON string
        const messageString = JSON.stringify(message);
        this.socket.send(messageString);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.error('Cannot send message, socket not connected');
    }
  }

  /**
   * Subscribe to all messages
   * @returns Unsubscribe function
   */
  public subscribeToMessages(callback: MessageListener): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status updates
   * @returns Unsubscribe function
   */
  public subscribeToStatus(callback: StatusListener): () => void {
    this.statusListeners.push(callback);
    // Immediately notify with current status
    callback(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Disconnect from the server
   */
  public disconnect(): void {
    if (this.socket) {
      try {
        this.socket.close();
        this.socket = null;
        this.updateStatus('disconnected');
      } catch (error) {
        console.error('Error while disconnecting:', error);
      }
    }
  }
}

export default WebSocketService;

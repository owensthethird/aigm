import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebSocketService, { 
  ConnectionStatus, 
  WebSocketMessage,
  ProviderStatusUpdate
} from '../services/WebSocketService';

interface WebSocketContextType {
  status: ConnectionStatus;
  sendMessage: (eventName: string, data: any) => void;
  messages: WebSocketMessage[];
  providerStatus: ProviderStatusUpdate[];
  clearMessages: () => void;
}

// Create the context with a default value
const WebSocketContext = createContext<WebSocketContextType>({
  status: 'disconnected',
  sendMessage: () => {},
  messages: [],
  providerStatus: [],
  clearMessages: () => {}
});

interface WebSocketProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

/**
 * WebSocket context provider for managing real-time communication
 * Provides connection status, message history, and methods to interact with the WebSocket
 */
export const WebSocketProvider = ({ 
  children, 
  serverUrl = 'http://localhost:3000' 
}: WebSocketProviderProps) => {
  // Get the websocket service instance
  const wsService = WebSocketService.getInstance();
  
  // State for connection status and messages
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [providerStatus, setProviderStatus] = useState<ProviderStatusUpdate[]>([]);

  // Initialize the websocket connection
  useEffect(() => {
    // Initialize the WebSocket service
    wsService.init(serverUrl);

    // Subscribe to connection status updates
    const statusUnsubscribe = wsService.subscribeToStatus((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to messages
    const messageUnsubscribe = wsService.subscribeToMessages((message) => {
      if (message.type === 'message' || message.type === 'system' || message.type === 'error') {
        setMessages(prev => [...prev, message]);
      } else if (message.type === 'provider_status') {
        // Update provider status
        const update = message.payload as ProviderStatusUpdate;
        setProviderStatus(prev => {
          const existingIndex = prev.findIndex(p => p.providerId === update.providerId);
          if (existingIndex >= 0) {
            const updatedList = [...prev];
            updatedList[existingIndex] = update;
            return updatedList;
          } else {
            return [...prev, update];
          }
        });
      }
      // Note: 'typing' events are handled directly by components that need them
    });

    // Cleanup on unmount
    return () => {
      statusUnsubscribe();
      messageUnsubscribe();
      wsService.disconnect();
    };
  }, [serverUrl]);

  // Function to send a message through the WebSocket
  const sendMessage = (eventName: string, data: any) => {
    // Create message object with type and data
    const message = {
      type: eventName,
      data: data
    };
    wsService.sendMessage(message);
  };

  // Function to clear message history
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <WebSocketContext.Provider value={{ 
      status, 
      sendMessage, 
      messages,
      providerStatus,
      clearMessages
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Custom hook for consuming the WebSocket context
 */
export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketContext;

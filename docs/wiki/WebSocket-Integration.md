# WebSocket Integration

## Overview

The aiGM application uses WebSockets for real-time communication between the frontend and backend. This document outlines the WebSocket architecture, recent refactoring work, and implementation details.

## Architecture

### Frontend (UI)
- **Location**: `ui/src/services/WebSocketService.ts`
- **Technology**: Native WebSocket API (previously used socket.io-client)
- **Connection URL**: `ws://localhost:3000` by default

### Backend
- **Location**: `src/websocket/websocket-server.ts`
- **Technology**: Native WebSocket server using `ws` npm package
- **Port**: Runs on port 3000 (shared with the Express HTTP server)

## Recent Refactoring

### Problem Statement

The frontend WebSocketService was initially implemented using socket.io-client, while the backend used the native WebSocket protocol via the `ws` package. This protocol mismatch prevented successful connections.

### Changes Made

1. **WebSocketService Refactoring**:
   - Migrated from socket.io-client to native WebSocket API
   - Implemented singleton pattern for connection management
   - Added proper event listeners (onopen, onclose, onerror, onmessage)
   - Implemented reconnection logic with exponential backoff and jitter
   - Fixed message sending and parsing
   - Added robust error handling

2. **Backend Server Fixes**:
   - Fixed syntax errors in `provider-manager.ts`
   - Resolved TypeScript issues with shutdown method
   - Added error handling for graceful server shutdown

3. **WebSocketContext Integration**:
   - Updated to use the refactored WebSocketService methods
   - Fixed TypeScript type issues

## Usage Guide

### Initializing Connection

```typescript
// Import the service
import WebSocketService from '../services/WebSocketService';

// Get the singleton instance
const wsService = WebSocketService.getInstance();

// Initialize connection with default URL (ws://localhost:3000)
wsService.init();

// Or with custom URL
wsService.init('ws://custom-server:8080');
```

### Sending Messages

Messages must be JSON-serializable objects with a `type` field:

```typescript
// Send a chat message
wsService.sendMessage({
  type: 'message',
  data: {
    content: 'Hello, AI!',
    role: 'user'
  }
});

// Send a typing indicator
wsService.sendMessage({
  type: 'typing',
  data: {
    isTyping: true
  }
});
```

### Subscribing to Events

```typescript
// Listen for all incoming messages
const unsubscribe = wsService.subscribeToMessages((message) => {
  console.log('Received message:', message);
  // Handle based on message type
  switch (message.type) {
    case 'message':
      // Handle chat message
      break;
    case 'typing':
      // Handle typing indicator
      break;
    case 'provider_status':
      // Handle provider status update
      break;
  }
});

// Later when component unmounts
unsubscribe();

// Subscribe to connection status changes
const statusUnsubscribe = wsService.subscribeToStatus((status) => {
  console.log('Connection status:', status);
  // status will be one of: 'connected', 'connecting', 'disconnected', or 'error'
});
```

### Disconnecting

```typescript
wsService.disconnect();
```

## UI Connection Implementation

The WebSocket connection is integrated with the UI following these principles:

### Color System for Message Contexts
1. **Administrative Context (Level 1)**: Red for user, Green for AI
2. **Out-of-Character Context (Level 2)**: Blue for player, Orange for AI 
3. **In-Character Context (Level 3)**: Green for player, Purple for AI

### WebSocket Status Indicators
- **Connected**: Green indicator
- **Connecting**: Yellow pulsing indicator
- **Disconnected/Error**: Red indicator with reconnect button

## Reconnection Strategy

The WebSocketService implements a sophisticated reconnection strategy:

1. **Exponential Backoff**: Reconnection attempts start at 1 second delay and increase exponentially
2. **Jitter**: Random factor applied to prevent thundering herd problem
3. **Maximum Cap**: Delay capped at 30 seconds to prevent excessive waiting
4. **Maximum Attempts**: Configurable maximum reconnection attempts before giving up

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure backend server is running on the expected port (3000)
   - Check for firewall or network issues

2. **Protocol Errors**:
   - Verify URL uses `ws://` protocol (not `http://` or `wss://`)
   - For secure connections, ensure proper certificates are in place

3. **Message Format Errors**:
   - All messages must be valid JSON with a `type` field
   - Check browser console for parsing errors

### Debugging Tips

1. Monitor connection status via browser console:
```javascript
WebSocketService.getInstance().subscribeToStatus(console.log);
```

2. Enable verbose logging by setting localStorage flag:
```javascript
localStorage.setItem('debug_websocket', 'true');
```

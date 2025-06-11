# AI Game Master Architecture

## Overview

The AI Game Master (aiGM) is a web application that provides an interactive storytelling experience for tabletop role-playing games. The system uses n8n workflows to handle AI processing and backend logic, with a React-based UI for user interaction.

## System Architecture

### Frontend (UI)

The UI is built with React and follows a component-based architecture organized into layout zones:

1. **Conversation Stream** - Main narrative and dialogue display
   - Component: `ChatInterface.tsx`
   - Purpose: Displays the conversation history between the user and AI Game Master

2. **Input Panel** - Text input and command interface
   - Component: `InputPanel.tsx`
   - Purpose: Handles user input with message type selection (IC/OOC/Admin)

3. **Character Pane** - Character sheets and stats
   - Component: `CharacterPanel.tsx`
   - Purpose: Displays and manages character information

4. **Control Strip** - Quick actions and session management
   - Component: `ControlStrip.tsx`
   - Purpose: Provides session controls and quick actions

5. **Status Bar** - Connection and system feedback
   - Component: `StatusBar.tsx`
   - Purpose: Shows WebSocket connection status and system messages

### Backend (n8n)

The backend functionality is handled entirely by n8n workflows:

- **Chat Trigger** - WebSocket endpoint that receives messages from the UI
  - Endpoint: `ws://localhost:5678/webhook/chat`
  - Message Format:
    ```json
    {
      "action": "sendMessage",
      "sessionId": "session_123",
      "message": "User message"
    }
    ```

- **AI Processing** - n8n workflows that process user messages and generate AI responses
  - Handles context management, AI model integration, and response generation
  - Returns responses via the WebSocket connection

## Communication Flow

1. User enters a message in the Input Panel
2. Message is sent via WebSocket to the n8n Chat Trigger endpoint
3. n8n workflow processes the message and generates a response
4. Response is sent back through the WebSocket connection
5. UI receives the message and displays it in the Conversation Stream

## Key Files

### UI Components
- `src/ui/components/ChatInterface.tsx` - Conversation display
- `src/ui/components/InputPanel.tsx` - User input handling
- `src/ui/components/CharacterPanel.tsx` - Character management
- `src/ui/components/ControlStrip.tsx` - Session controls
- `src/ui/components/StatusBar.tsx` - System status

### Services
- `src/ui/services/ChatService.ts` - Handles message sending via WebSocket
- `src/ui/services/WebSocketService.ts` - Manages WebSocket connection

### n8n Integration
- `src/n8n-client.ts` - API client for interacting with n8n
- Test scripts for n8n workflow validation

## Running the Application

1. Start n8n with the Chat Trigger workflow active
2. Start the UI application with `npm run ui`
3. Connect to the UI at `http://localhost:3000`

## Development Notes

- The UI is completely decoupled from the backend, communicating solely via WebSocket
- Session state is maintained in the UI and synchronized with n8n via the sessionId
- All AI processing happens in n8n workflows, not in the UI code

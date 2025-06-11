# AI Game Master (aiGM)

An interactive storytelling companion for tabletop role-playing games powered by AI and n8n workflows.

## Overview

AI Game Master provides an immersive tabletop RPG experience by acting as an AI-powered game master. The system uses n8n workflows for backend processing and AI integration, with a React-based UI for user interaction.

## Features

- Interactive storytelling powered by AI
- Real-time game state management
- Character creation and tracking
- Multiple visualization themes
- Session management

## Architecture

The application follows a modern architecture with:

- **Frontend**: React-based UI with WebSocket communication
- **Backend**: n8n workflows for AI processing and business logic
- **Communication**: WebSocket-based messaging via n8n Chat Trigger

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites

- Node.js (v16+)
- n8n installed and running
- n8n Chat Trigger workflow configured

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/aiGM.git
   cd aiGM
   ```

2. Install dependencies:
   ```
   npm install
   cd ui
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     N8N_API_URL=http://localhost:5678/api/v1
     N8N_API_KEY=your_n8n_api_key
     ```

## Running the Application

1. Ensure n8n is running with the Chat Trigger workflow active:
   ```
   n8n start
   ```

2. Start the UI application:
   ```
   npm run ui
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

### UI Structure

The UI is organized into layout zones:

- **Conversation Stream**: Main narrative and dialogue display
- **Input Panel**: Text input and command interface
- **Character Pane**: Character sheets and stats
- **Control Strip**: Quick actions and session management
- **Status Bar**: Connection and system feedback

### WebSocket Communication

The UI communicates with n8n via WebSocket using the following message format:

```json
{
  "action": "sendMessage",
  "sessionId": "session_123",
  "message": "User message"
}
```

## License

[MIT License](./LICENSE)

## Acknowledgements

- n8n for workflow automation
- React for the UI framework
- All contributors to this project

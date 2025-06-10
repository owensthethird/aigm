# AI Game Master UI

This is the user interface for the AI Game Master application, designed to provide an immersive experience for tabletop role-playing games with AI assistance.

## Project Structure

The UI project follows a modular structure:

```
ui/
├── public/                 # Static assets
├── src/
│   ├── api/                # API service modules
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout components
│   ├── pages/              # Page components
│   ├── styles/             # CSS and styling
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Features

- Three-panel responsive layout for game management
- Real-time chat interface with context-based styling
- Character creation and management
- Game state tracking and visualization
- n8n API integration for AI interactions
- Multiple visual themes

## Color System

The UI implements a comprehensive color system with context-based communication:

- **Administrative Context**: System-level communications with the user and AI
- **Out-of-Character Context**: Meta-game discussions and game mechanics
- **In-Character Context**: Narrative gameplay interactions and storytelling

Each context has distinct color schemes for both user and AI messages, creating a clear visual hierarchy.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- n8n instance running (for full functionality)

### Installation

1. Navigate to the UI directory:
   ```
   cd ui
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

Before using the application with n8n:

1. Make sure your n8n instance is running
2. Configure the API connection in the settings panel with:
   - Base URL (default: http://localhost:5678)
   - API Key

## Building for Production

To create a production build:

```
npm run build
```
or
```
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Extending the UI

To add new components or features:

1. Create new components in the appropriate directories
2. Update context providers as needed
3. Implement additional hooks for specific functionality
4. Add new pages and routes in App.tsx

## Related Documentation

- See the interface design document for detailed UI specifications
- Refer to the color system documentation for the visual design guidelines

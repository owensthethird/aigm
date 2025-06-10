# AI Game Master Interface Design

## Overview

This document outlines the design for the AI Game Master (aiGM) web interface, a React-based application that will provide users with a rich, interactive environment for tabletop role-playing game experiences facilitated by an AI game master.

## Core Objectives

- Create an intuitive, immersive chat interface for player-AI interaction
- Display game state information in a clear, organized manner
- Support responsive design for different screen sizes
- Implement a visually appealing UI with thematic elements
- Ensure accessibility for all users

## User Interface Components

### 1. Main Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Header/Navigation                                            │
├──────────────────┬───────────────────────┬──────────────────┤
│                  │                       │                  │
│                  │                       │                  │
│  Game State      │  Chat Interface       │  Character/      │
│  Panel           │                       │  Game Info       │
│                  │                       │                  │
│                  │                       │                  │
│                  │                       │                  │
├──────────────────┴───────────────────────┴──────────────────┤
│ Footer (System Status, Settings)                            │
└──────────────────────────────────────────────────────────────┘
```

### 2. Component Breakdown

#### Header/Navigation
- Game title and branding
- Main navigation menu
- Session controls (start new game, save game, load game)
- User profile/settings

#### Chat Interface
- Message history with AI and player exchanges
- Message composition area
- Rich formatting options for messages
- Support for dice roll commands
- Image/map display capabilities
- Context-aware suggestions

#### Game State Panel
- Current scene/environment description
- Active quests/objectives
- Environmental conditions
- Initiative tracker (for combat)
- Interactive map (when available)

#### Character/Game Info
- Character sheets for players
- NPC tracking
- Inventory management
- Game rules reference
- Session history/notes

#### Footer
- System status (connected, processing, etc.)
- API connection status
- Settings shortcuts
- Help/documentation access

## Responsive Design Strategy

### Desktop View
- Three-column layout as shown in the diagram
- Full feature set visible
- Rich interactive elements

### Tablet View
- Two-column layout with the Game State and Character panels collapsible
- Focus on the chat interface
- Swipeable panels for additional information

### Mobile View
- Single column layout with focus on chat
- Bottom navigation bar for accessing other panels
- Simplified UI with expandable sections

## Visual Design

### Theme Options

1. **Classic Fantasy**
   - Parchment textures
   - Fantasy-inspired typography
   - Rich, warm color palette
   - Subtle ambient animations

2. **Modern Minimalist**
   - Clean, simple interface
   - High contrast for readability
   - Customizable accent colors
   - Focus on typography and spacing

3. **Sci-Fi/Cyberpunk**
   - Dark interface with neon accents
   - Tech-inspired UI elements
   - Subtle glow effects
   - Angular design elements

### Design System

- **Typography**:
  - Primary: A readable sans-serif (Roboto, Inter)
  - Headers: Thematic font based on game genre
  - Game text: Slightly stylized but highly readable

- **Color Palette**: 
  - See [color-system.md](./color-system.md) for the complete color specification
  - **Context-Based Color Architecture**:
    - Administrative functions: Red-Rose (`#e11d48`) ↔ Teal-Forest (`#047857`)
    - Out-of-character communication: Blue-Sapphire (`#1d4ed8`) ↔ Orange-Topaz (`#ea580c`)
    - In-character narrative: Green-Emerald (`#16a34a`) ↔ Purple-Orchid (`#c026d3`)
  - **Core Background Stack**:
    - Primary Background: `#070b14` (base layer)
    - Secondary Background: `#0f1419` (component layer)
    - Tertiary Background: `#1a1f26` (content layer)
  - **System State Indicators**:
    - Active, Processing, Success, Warning, Error, Idle states
    - Animated gradients for dynamic feedback

- **UI Elements**:
  - Custom buttons with appropriate styling
  - Cards for information containers
  - Dialog boxes for interactions
  - Custom form controls
  - Tooltips and popovers

## Interaction Design

### Chat Interactions
- Natural language input with command highlighting
- Support for special commands (e.g., /roll 2d6, /whisper)
- Message types (narration, dialogue, system messages, dice results)
- Typing indicators
- Message reactions

### Game State Management
- Interactive elements for modifying state
- Drag-and-drop functionality for items/characters
- Collapsible sections for organization
- Real-time updates across all connected clients

### Animations and Transitions
- Subtle transitions between states
- Loading indicators
- Message appearance animations
- Dice rolling animations
- Status change indicators

## Technical Considerations

### Frontend Architecture
- React with functional components
- TypeScript for type safety
- State management with Context API and/or Redux
- CSS-in-JS solution (Styled Components or Emotion)

### Key Libraries
- React Router for navigation
- Socket.IO for real-time communication
- React Query for data fetching
- Framer Motion for animations
- Material UI or Chakra UI as component foundation

### Backend Integration
- WebSocket connection to n8n for real-time updates
- RESTful API for game state management
- Authentication and session management

## Accessibility Considerations
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements
- Resizable text and UI elements

## Implementation Phases

### Phase 1: Core Chat Interface
- Basic layout structure
- Functional chat messaging
- Connection to backend AI service
- Simple game state display

### Phase 2: Enhanced Game State
- Character sheet integration
- Interactive elements
- Dice rolling functionality
- Basic responsive design

### Phase 3: Polish and Advanced Features
- Theme implementation
- Advanced animations
- Full responsive design
- Accessibility improvements
- Performance optimization

## Prototyping Plan

1. Create wireframes for key screens
2. Develop a component storybook
3. Build a clickable prototype
4. Conduct user testing with tabletop gamers
5. Refine based on feedback

## User Testing Goals

- Validate intuitive navigation
- Ensure clarity of game state information
- Test chat interface effectiveness
- Evaluate overall user satisfaction
- Identify pain points or missing features

---

This design document will guide the development of the aiGM interface, ensuring a cohesive, user-friendly experience that enhances tabletop role-playing games through AI assistance.
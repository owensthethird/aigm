# AI Game Master UI Implementation Plan

This document outlines the implementation strategy for bringing the UI in line with the established interface design and color system. The plan follows a milestone-based approach, starting with the easiest tasks and progressing to more complex implementations.

## Table of Contents
1. [Color System Overview](#color-system-overview)
2. [Milestone 1: Base Styling and Structure](#milestone-1-base-styling-and-structure)
3. [Milestone 2: Component Structure and Context Setup](#milestone-2-component-structure-and-context-setup)
4. [Milestone 3: Basic UI Components and Styling](#milestone-3-basic-ui-components-and-styling)
5. [Milestone 4: Basic Component Functionality](#milestone-4-basic-component-functionality)
6. [Milestone 5: Event Handling and Basic Interactivity](#milestone-5-event-handling-and-basic-interactivity)
7. [Milestone 6: Advanced Component Integration](#milestone-6-advanced-component-integration)
8. [Milestone 7: Responsive Design Implementation](#milestone-7-responsive-design-implementation)
9. [Milestone 8: Advanced Interactivity and Polish](#milestone-8-advanced-interactivity-and-polish)
10. [Milestone 9: Accessibility and Final Testing](#milestone-9-accessibility-and-final-testing)
11. [UI Element Connection System](#ui-element-connection-system)

## Color System Overview

The aiGM application uses a sophisticated color system organized into three contextual levels:

1. **Administrative Context (Level 1)**
   - User Administrative Functions: Red-based palette (`--admin-user-*`)
   - AI Administrative Functions: Green-based palette (`--admin-ai-*`)

2. **Out-of-Character Context (Level 2)**
   - Player Meta-Communication: Blue-based palette (`--ooc-player-*`)
   - AI Meta-Communication: Orange-based palette (`--ooc-ai-*`)

3. **In-Character Context (Level 3)**
   - Player Narrative Actions: Green-based palette (`--ic-player-*`)
   - AI Narrative Responses: Purple-based palette (`--ic-ai-*`)

Each context has consistent variable naming with the following suffixes:
- `-primary`: Main color for elements
- `-bg-alpha`: Semi-transparent background
- `-border-alpha`: Semi-transparent border
- `-accent`: Highlight/accent color
- `-shadow`: Shadow effect

Additionally, the system includes state colors (active, processing, success, warning, error, idle) and text colors (primary, secondary, tertiary, disabled).

## Milestone 1: Base Styling and Structure

### Overview
This milestone focuses on establishing the foundational styling and structure for the application. We'll implement the basic layout grid, typography, and panel containers.

### Implementation Details

#### Main Layout Structure

```css
.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background-color: var(--primary-background);
  color: var(--text-primary);
}

.header {
  background-color: var(--secondary-background);
  border-bottom: 1px solid var(--tertiary-background);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr; /* Mobile-first approach */
  height: 100%;
  overflow: hidden;
}

.footer {
  background-color: var(--secondary-background);
  border-top: 1px solid var(--tertiary-background);
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-tertiary);
}
```

#### Panel Containers

```css
.left-panel, .right-panel, .center-panel {
  height: 100%;
  overflow-y: auto;
  background-color: var(--secondary-background);
}

.panel-header {
  padding: 1rem;
  background-color: var(--tertiary-background);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-content {
  padding: 1rem;
}
```

#### Basic Typography

```css
/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-size: 1.75rem;
}

h4 {
  font-size: 1.5rem;
}

h5 {
  font-size: 1.25rem;
}

h6 {
  font-size: 1rem;
}

p {
  margin-bottom: 1rem;
  line-height: 1.5;
}
```

### Testing Criteria
- Verify that CSS variables from the color system are properly applied
- Confirm that the basic grid layout renders correctly
- Check that typography styles are consistent and readable
- Ensure panel containers have proper styling and scrolling behavior

## Milestone 2: Component Structure and Context Setup

### Overview
This milestone focuses on setting up the React component structure and context providers that will manage state throughout the application.

### Implementation Details

#### Context Providers

```jsx
// ThemeContext.tsx
import React, { createContext, useState, useContext } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

#### Basic Header Component

```jsx
// Header.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../contexts/ApiContext';

const Header: React.FC = () => {
  const { theme } = useTheme();
  const { isConnected } = useApi();
  
  return (
    <header className="header">
      <div className="logo">
        <h1>AI Game Master</h1>
      </div>
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'gradient-success' : 'gradient-error'}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <nav className="main-nav">
        <button className="mobile-only">Game State</button>
        <button className="mobile-only">Character Info</button>
      </nav>
    </header>
  );
};

export default Header;
```

#### Basic Footer Component

```jsx
// Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>AI Game Master &copy; {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;
```

### Testing Criteria
- Verify that all context providers are properly nested in the component tree
- Confirm that contexts are accessible in child components
- Check that Header and Footer components render correctly
- Test that theme values are properly passed through context

## Milestone 3: Basic UI Components and Styling

### Overview
This milestone focuses on implementing the core UI components with appropriate styling based on the color system.

### Implementation Details

#### Message Components

```css
.message {
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
}

/* Message type styling using our color system */
.admin-user-message {
  align-self: flex-end;
  background-color: var(--admin-user-bg-alpha);
  border: 1px solid var(--admin-user-border-alpha);
  box-shadow: var(--admin-user-shadow);
}

.admin-ai-message {
  align-self: flex-start;
  background-color: var(--admin-ai-bg-alpha);
  border: 1px solid var(--admin-ai-border-alpha);
  box-shadow: var(--admin-ai-shadow);
}

.ooc-player-message {
  align-self: flex-end;
  background-color: var(--ooc-player-bg-alpha);
  border: 1px solid var(--ooc-player-border-alpha);
  box-shadow: var(--ooc-player-shadow);
}

.ooc-ai-message {
  align-self: flex-start;
  background-color: var(--ooc-ai-bg-alpha);
  border: 1px solid var(--ooc-ai-border-alpha);
  box-shadow: var(--ooc-ai-shadow);
}

.ic-player-message {
  align-self: flex-end;
  background-color: var(--ic-player-bg-alpha);
  border: 1px solid var(--ic-player-border-alpha);
  box-shadow: var(--ic-player-shadow);
}

.ic-ai-message {
  align-self: flex-start;
  background-color: var(--ic-ai-bg-alpha);
  border: 1px solid var(--ic-ai-border-alpha);
  box-shadow: var(--ic-ai-shadow);
}
```

#### Status Indicators

```css
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.gradient-success {
  background: linear-gradient(to right, var(--success-state-from), var(--success-state-to));
}

.gradient-error {
  background: linear-gradient(to right, var(--error-state-from), var(--error-state-to));
}

.gradient-processing {
  background: linear-gradient(to right, var(--processing-state-from), var(--processing-state-to));
}

.gradient-idle {
  background: linear-gradient(to right, var(--idle-state-from), var(--idle-state-to));
}
```

#### Button Styles

```css
.primary-button {
  background: linear-gradient(to right, var(--active-state-from), var(--active-state-to));
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.type-button {
  padding: 0.5rem;
  border-radius: 4px;
  background-color: var(--tertiary-background);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.type-button.active {
  background-color: var(--ooc-player-bg-alpha);
  color: var(--ooc-player-accent);
  border: 1px solid var(--ooc-player-border-alpha);
}

.type-button:hover:not(.active) {
  background-color: var(--tertiary-background);
  color: var(--text-primary);
}
```

### Testing Criteria
- Verify that message styles match the color system specifications
- Confirm that status indicators display correctly with appropriate gradients
- Check that buttons have the correct styling and hover states
- Test that all components maintain proper contrast ratios

## Milestone 4: Basic Component Functionality

### Overview
This milestone focuses on implementing the basic functionality of the main components, including the HomePage, WelcomeScreen, and ChatInterface structure.

### Implementation Details

#### HomePage Component

```jsx
// HomePage.tsx
import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { useGameState } from '../contexts/GameStateContext';

const HomePage: React.FC = () => {
  const { gameState, startGame } = useGameState();

  // Welcome screen shown when no active game is running
  const WelcomeScreen = () => (
    <div className="welcome-screen">
      <h2>Welcome to AI Game Master</h2>
      <p>Your interactive storytelling companion for tabletop role-playing games.</p>
      
      <div className="action-buttons">
        <button 
          className="primary-button"
          onClick={() => startGame('New Adventure', 'Fantasy RPG')}
        >
          Start New Game
        </button>
      </div>
      
      <div className="features-overview">
        <h3>Features</h3>
        <ul>
          <li>Interactive storytelling powered by AI</li>
          <li>Real-time game state management</li>
          <li>Character creation and tracking</li>
          <li>Multiple visualization themes</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {gameState.status === 'idle' ? (
        <WelcomeScreen />
      ) : (
        <ChatInterface />
      )}
    </div>
  );
};

export default HomePage;
```

#### Basic ChatInterface Structure

```jsx
// ChatInterface.tsx
import React from 'react';

// Message types based on our color system
export type MessageType = 
  | 'admin-user' 
  | 'admin-ai' 
  | 'ooc-player' 
  | 'ooc-ai' 
  | 'ic-player' 
  | 'ic-ai';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  sender: string;
}

const ChatInterface: React.FC = () => {
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {/* Message list will be implemented in later milestone */}
      </div>
      
      <div className="chat-input-container">
        <div className="message-type-selector">
          <button className="type-button">IC</button>
          <button className="type-button active">OOC</button>
          <button className="type-button">Admin</button>
        </div>
        
        <form className="chat-input-form">
          <textarea
            className="chat-input"
            placeholder="Type your message..."
            rows={2}
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
```

#### Panel Content Areas

```jsx
// GameStatePanel.tsx
import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const GameStatePanel: React.FC = () => {
  const { gameState } = useGameState();
  
  return (
    <div className="panel-content">
      <div className="game-status">
        <div className={`status-badge gradient-${gameState.status}`}>
          {gameState.status.charAt(0).toUpperCase() + gameState.status.slice(1)}
        </div>
        <h3>{gameState.sessionName || 'No Active Session'}</h3>
        <p>System: {gameState.gameSystem || 'N/A'}</p>
      </div>
      
      <div className="game-events">
        <h4>Recent Events</h4>
        <ul className="event-list">
          {gameState.events.length === 0 ? (
            <li className="empty-state">No events yet</li>
          ) : (
            gameState.events.slice(-5).reverse().map(event => (
              <li key={event.id} className="event-item">
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="event-description">
                  {event.description}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default GameStatePanel;
```

### Testing Criteria
- Verify that HomePage conditionally renders the correct component based on game state
- Confirm that WelcomeScreen displays properly with all elements
- Check that the basic ChatInterface structure is in place with input area and type selector
- Test that panel content areas render properly and display game state information

## Milestone 5: Event Handling and Basic Interactivity

### Overview
This milestone focuses on implementing event handling and basic interactivity for the main components, including message sending, type selection, and panel toggling.

### Implementation Details

#### Message Handling in ChatInterface

```jsx
// ChatInterface.tsx (updated with state and handlers)
import React, { useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';

// Message types based on our color system
export type MessageType = 
  | 'admin-user' 
  | 'admin-ai' 
  | 'ooc-player' 
  | 'ooc-ai' 
  | 'ic-player' 
  | 'ic-ai';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  sender: string;
}

const ChatInterface: React.FC = () => {
  const { gameState, addMessage } = useGameState();
  const [messageInput, setMessageInput] = useState('');
  const [activeType, setActiveType] = useState<'IC' | 'OOC' | 'Admin'>('OOC');
  const [messages, setMessages] = useState<ChatMessage[]>(gameState.messages || []);
  
  // Map the UI type selection to actual message types
  const getMessageType = (): MessageType => {
    switch (activeType) {
      case 'IC': return 'ic-player';
      case 'OOC': return 'ooc-player';
      case 'Admin': return 'admin-user';
      default: return 'ooc-player';
    }
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: getMessageType(),
      content: messageInput,
      timestamp: Date.now(),
      sender: 'Player'
    };
    
    // Add to local state
    setMessages(prev => [...prev, newMessage]);
    
    // Add to game state
    addMessage(newMessage);
    
    // Clear input
    setMessageInput('');
    
    // Simulate AI response (in a real app, this would come from the API)
    setTimeout(() => {
      const aiResponseType = 
        activeType === 'IC' ? 'ic-ai' : 
        activeType === 'OOC' ? 'ooc-ai' : 'admin-ai';
      
      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        type: aiResponseType,
        content: `AI response to your ${activeType} message: ${messageInput}`,
        timestamp: Date.now(),
        sender: 'AI GM'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      addMessage(aiResponse);
    }, 1000);
  };
  
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-sender">{message.sender}</div>
            <div className="message-content">{message.content}</div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="chat-input-container">
        <div className="message-type-selector">
          {(['IC', 'OOC', 'Admin'] as const).map(type => (
            <button 
              key={type}
              className={`type-button ${activeType === type ? 'active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <textarea
            className="chat-input"
            placeholder="Type your message..."
            rows={2}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button type="submit" className="send-button primary-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
```

#### Panel Toggle Implementation

```jsx
// MainLayout.tsx (updated with panel toggle functionality)
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../contexts/ApiContext';
import { useGameState } from '../contexts/GameStateContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameStatePanel from '../components/GameStatePanel';
import CharacterPanel from '../components/CharacterPanel';

const MainLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isConnected } = useApi();
  const { gameState } = useGameState();
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const toggleLeftPanel = () => {
    setLeftPanelOpen(!leftPanelOpen);
    if (!leftPanelOpen) setRightPanelOpen(false);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
    if (!rightPanelOpen) setLeftPanelOpen(false);
  };

  return (
    <div className={`app theme-${theme}`}>
      <Header 
        toggleLeftPanel={toggleLeftPanel}
        toggleRightPanel={toggleRightPanel}
      />

      <div className="main-content">
        <div className={`left-panel ${leftPanelOpen ? 'open' : ''}`}>
          <div className="panel-header">
            <h2>Game State</h2>
            <button 
              className="close-panel" 
              onClick={() => setLeftPanelOpen(false)}
            >
              &times;
            </button>
          </div>
          <GameStatePanel />
        </div>
        
        <div className="center-panel">
          <Outlet />
        </div>
        
        <div className={`right-panel ${rightPanelOpen ? 'open' : ''}`}>
          <div className="panel-header">
            <h2>Character Info</h2>
            <button 
              className="close-panel" 
              onClick={() => setRightPanelOpen(false)}
            >
              &times;
            </button>
          </div>
          <CharacterPanel />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
```

### Animation Styles

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.message {
  animation: fadeIn 0.3s ease-in-out;
}

.typing-indicator {
  animation: pulse 1.5s infinite;
}

.panel-transition {
  transition: all 0.3s ease-in-out;
}

.left-panel, .right-panel {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.left-panel:not(.open), .right-panel:not(.open) {
  transform: translateX(-100%);
  opacity: 0;
}

.right-panel:not(.open) {
  transform: translateX(100%);
}
```

### Testing Criteria
- Verify that message sending works correctly with proper message type assignment
- Confirm that message type selection changes the styling of sent messages
- Check that panel toggling works correctly with proper animations
- Test that simulated AI responses appear with correct styling based on message type
- Ensure that all interactive elements have appropriate hover and active states

## Responsive Design Approach

The UI will adapt to different screen sizes using the following approach:

1. **Mobile Layout (< 768px)**
   - Panels will be hidden by default and shown via overlay when toggled
   - Chat interface will take full width
   - Message input area will be simplified

2. **Tablet Layout (768px - 1024px)**
   - Two-column layout with chat in main area
   - Panels will be collapsible but not overlaid

3. **Desktop Layout (> 1024px)**
   - Three-column layout with all panels visible
   - Enhanced chat interface with additional features

Implementation:

```css
/* Base styles for mobile first */
.main-content {
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  overflow: hidden;
}

.left-panel, .right-panel {
  position: fixed;
  top: 0;
  height: 100%;
  width: 80%;
  max-width: 300px;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.right-panel {
  right: 0;
  transform: translateX(100%);
}

.left-panel.open, .right-panel.open {
  transform: translateX(0);
}

/* Tablet layout */
@media (min-width: 768px) {
  .main-content {
    grid-template-columns: 250px 1fr;
  }
  
  .left-panel {
    position: relative;
    transform: none;
    width: 100%;
  }
  
  .right-panel {
    position: fixed;
  }
}

/* Desktop layout */
@media (min-width: 1024px) {
  .main-content {
    grid-template-columns: 250px 1fr 250px;
  }
  
  .left-panel, .right-panel {
    position: relative;
    transform: none;
    width: 100%;
  }
}
```

## Accessibility Considerations

1. **Color Contrast**
   - All text will maintain a minimum contrast ratio of 4.5:1 against its background
   - Interactive elements will have clear focus states

2. **Keyboard Navigation**
   - All interactive elements will be focusable and operable via keyboard
   - Focus order will follow a logical sequence

3. **Screen Reader Support**
   - Semantic HTML elements will be used appropriately
   - ARIA attributes will be added where necessary
   - Messages will include proper role and aria-live attributes

4. **Reduced Motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.001ms !important;
       transition-duration: 0.001ms !important;
     }
   }
   ```

## Implementation Timeline

1. **Phase 1: Base Styling (Week 1)**
   - Apply color system variables to all components
   - Implement base layout structure
   - Style typography and basic elements

2. **Phase 2: Component Styling (Week 2)**
   - Implement chat interface styling
   - Style panels and their contents
   - Create button and form element styles

3. **Phase 3: Responsive Design (Week 3)**
   - Implement mobile-first responsive layouts
   - Test and refine breakpoints
   - Ensure proper panel behavior on all devices

4. **Phase 4: Animation and Polish (Week 4)**
   - Add animations and transitions
   - Implement accessibility features
   - Final testing and refinement

## UI Element Connection System

This section outlines how the various UI elements are interconnected within the application architecture to ensure all components work together cohesively.

### 1. Component Hierarchy and Data Flow

```
App
├── ThemeProvider (context)
├── ApiProvider (context)
├── GameStateProvider (context)
└── MainLayout
    ├── Header
    │   ├── Logo
    │   ├── ConnectionStatus (uses ApiContext)
    │   └── Navigation
    ├── MainContent
    │   ├── LeftPanel (Game State Panel)
    │   │   └── GameEvents (uses GameStateContext)
    │   ├── CenterPanel
    │   │   └── HomePage
    │   │       ├── WelcomeScreen (when game.status === 'idle')
    │   │       └── ChatInterface (when game active)
    │   │           ├── MessageList
    │   │           └── MessageInput
    │   └── RightPanel (Character Panel)
    │       └── CharacterList (uses GameStateContext)
    └── Footer
```

### 2. Context Dependencies

1. **ThemeContext**
   - Provides: `theme`, `setTheme`
   - Used by: MainLayout, potentially all components for theme-specific styling
   - Connection points: `className={`theme-${theme}`}` on root elements

2. **ApiContext**
   - Provides: `isConnected`, `sendMessage`, `fetchData`
   - Used by: ConnectionStatus component, ChatInterface
   - Connection points: Status indicators, message sending functions

3. **GameStateContext**
   - Provides: `gameState`, `startGame`, `addGameEvent`, etc.
   - Used by: HomePage, ChatInterface, Game panels
   - Connection points: Conditional rendering, game event logging

### 3. CSS Class Connections

1. **Theme Classes**
   - Root class: `.theme-${theme}` applied to `.app`
   - Connected to: All themed components via CSS variable inheritance

2. **Message Type Classes**
   - Base class: `.message`
   - Specific classes: `.${messageType}-message` (e.g., `.ic-player-message`)
   - Connected to: Message components in ChatInterface

3. **Status Classes**
   - Base class: `.status-indicator`
   - State classes: `.gradient-${state}` (e.g., `.gradient-success`)
   - Connected to: Status indicators throughout the app

4. **Panel Classes**
   - Base classes: `.left-panel`, `.right-panel`, `.center-panel`
   - State classes: `.open` for mobile panel visibility
   - Connected to: Panel toggle state in MainLayout

### 4. Event Handling Connections

1. **Panel Toggling**
   - Functions: `toggleLeftPanel()`, `toggleRightPanel()`
   - Connected to: Navigation buttons and overlay click handler

2. **Message Sending**
   - Function: `handleSendMessage()`
   - Connected to: Form submission and Enter key press in ChatInterface

3. **Game State Changes**
   - Function: `startGame()`, `addGameEvent()`
   - Connected to: Button clicks and message events

### 5. Implementation Checklist

- [ ] Ensure all components have access to required contexts
- [ ] Verify CSS class naming consistency across components
- [ ] Confirm that state changes properly trigger UI updates
- [ ] Test that event handlers correctly modify connected components
- [ ] Validate that responsive design classes work together at all breakpoints
- [ ] Check that animations don't interfere with component state transitions
- [ ] Ensure accessibility features are consistently implemented across connected elements

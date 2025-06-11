# Updated AI Game Master UI Wireframe

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ┌───┐              ┌──────────────────────────────────────┐                        │
│ │   │ Logo Icon    │ Player Knowledge Search Bar          │                        │
│ └───┘              └──────────────────────────────────────┘                        │
│                                                                                   │
│ ┌───────────────┐  ┌──────────────────────────────────────┐  ┌─────────────────┐  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │ Player Info   │  │            Chat Window              │  │ Custom User     │  │
│ │ Panel         │  │                                      │  │ Panel (TBD)    │  │
│ │               │  │                                      │  │                 │  │
│ │ (Character    │  │                                      │  │                 │  │
│ │  Pane)        │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │ ↔ Resizable   │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │          Chat Context Toggle         │  │                 │  │
│ │               │  │              ┌──────┐                │  │                 │  │
│ │               │  │              │      │                │  │                 │  │
│ │               │  │              └──────┘                │  │                 │  │
│ │               │  │                                      │  │                 │  │
│ │               │  │ ┌─────┐───────────────────────┌─────┐│  │                 │  │
│ │               │  │ │IC/  │  User Input           │Send ││  │                 │  │
│ │               │  │ │OOC  │                       │     ││  │                 │  │
│ │               │  │ │Tog. │                       │     ││  │                 │  │
│ │               │  │ └─────┘───────────────────────└─────┘│  │                 │  │
│ │               │  │                                      │  │                 │  │
│ └───────────────┘  └──────────────────────────────────────┘  └─────────────────┘  │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**With Sliding Panel Open:**

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ┌───┐              ┌──────────────────────────────────────┐                        │
│ │   │ Logo Icon    │ Player Knowledge Search Bar          │                        │
│ └───┘              └──────────────────────────────────────┘                        │
│                                                                                   │
│ ┌───────────────┐  ┌──────────────────────────────────────┐                        │
│ │ ┌───┬───┬───┐ │  │                                      │                        │
│ │ │Tab│Tab│Tab│ │  │                                      │                        │
│ │ └───┴───┴───┘ │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │ Sliding Panel │  │            Chat Window              │                        │
│ │ (Tabbed)      │  │            (Pushed Right)           │                        │
│ │               │  │                                      │                        │
│ │ - Covenant    │  │                                      │                        │
│ │ - Laboratory  │  │                                      │                        │
│ │ - Other       │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │                                      │                        │
│ │               │  │          Chat Context Toggle         │                        │
│ │               │  │              ┌──────┐                │                        │
│ │               │  │              │      │                │                        │
│ │               │  │              └──────┘                │                        │
│ │               │  │                                      │                        │
│ │               │  │ ┌─────┐───────────────────────┌─────┐│                        │
│ │               │  │ │IC/  │  User Input           │Send ││                        │
│ │               │  │ │OOC  │                       │     ││                        │
│ │               │  │ │Tog. │                       │     ││                        │
│ │               │  │ └─────┘───────────────────────└─────┘│                        │
│ │               │  │                                      │                        │
│ └───────────────┘  └──────────────────────────────────────┘                        │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Layout Design Principles

### Modular Panel System
- Each panel is a flexible "board" component that can contain any content
- Panels have minimum width/height constraints based on their type
- All panels are resizable by the user via drag handles
- Standardized padding (16px) prevents content from touching edges
- Consistent spacing (12px) between elements within panels

### Sliding Panel System
- Additional panel can slide in from the left side
- Contains tabbed interface (Covenant Overview, Laboratory Overview, etc.)
- When open:
  - Covers the Player Info panel
  - Pushes Chat Window to the right
  - Pushes Custom User Panel off-screen
- Provides contextual tools without losing chat visibility

### 1. Top Navigation Area
- **New Element**: Logo icon in top-left corner
- **New Element**: Player knowledge search bar in top center
- **Removed**: Control Strip with action buttons (New Game, Save, Load)

### 2. Three-Column Layout with Equal Spacing
- **Left Column**: Player info panel (Character Pane) as a board
- **Center Column**: Chat window with integrated input at bottom as a board
- **Right Column**: Custom user pane (TBD functionality) as a board

### 3. Chat Interface Enhancements
- **New Element**: Chat context toggle button in center column
- **Improved**: IC/OOC toggle directly integrated with input field
- **Removed**: Separate Status Bar at bottom

## Component Mapping to Current Implementation

### Current Components → New Layout
1. **ControlStrip** → Functionality could be integrated into top navigation or as buttons in the Player Info Panel
2. **ChatInterface** → Chat window in center column
3. **CharacterPanel** → Player info panel in left column
4. **InputPanel** → Input area at bottom of center column with IC/OOC toggle
5. **StatusBar** → Could be integrated as subtle indicators in the top navigation area

## Implementation Considerations

### 1. Modular Panel System
- **Base Panel Component**: Reusable component with resize functionality
- **Minimum Size Constraints**: Each panel type has specific minimum dimensions
- **Resize Handles**: Interactive elements for user resizing
- **Panel State Management**: Track and persist panel sizes across sessions
- **Content Overflow Handling**: Scrollable content areas within fixed panels

### 2. Sliding Panel Implementation
- **Animation System**: Smooth transitions when opening/closing
- **Tab Management**: Component for handling tab selection and content switching
- **Layout Adjustment**: Logic to push chat window and hide custom user panel
- **State Persistence**: Remember active tab between toggles
- **Toggle Controls**: Button or gesture to trigger sliding panel

### 3. Board Styling Implementation
- **Standardized Padding**: All boards use 16px padding internally
- **Border Radius**: 8px rounded corners on all boards
- **Shadow Effects**: Subtle drop shadows (0 2px 4px rgba(0,0,0,0.1))
- **Background**: Slightly elevated with subtle contrast from main background
- **Content Spacing**: 12px between elements within boards

### 4. Color System Integration
- **Administrative Context (Level 1)**: Red for user, Green for AI
- **Out-of-Character Context (Level 2)**: Blue for player, Orange for AI
- **In-Character Context (Level 3)**: Green for player, Purple for AI
- Color system applied to message bubbles in the chat window
- Color indicators on IC/OOC toggle to show current context

### 5. Responsive Design
- **Panel Stacking**: Columns stack on mobile with collapsible panels
- **Priority Content**: Chat window takes precedence on smaller screens
- **Adaptive Controls**: Sliding panel becomes full-screen overlay on mobile
- **Minimum Sizes**: Ensure usability even at smallest supported dimensions

## CSS Implementation Example

```css
/* Board/Panel System */
.board {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 8px;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.board-title {
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaeaea;
}

.board-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px; /* Space for scrollbar */
}

/* Resize Handles */
.resize-handle {
  position: absolute;
  background-color: transparent;
}

.resize-handle-right {
  cursor: ew-resize;
  height: 100%;
  width: 8px;
  top: 0;
  right: 0;
}

.resize-handle-bottom {
  cursor: ns-resize;
  width: 100%;
  height: 8px;
  bottom: 0;
  left: 0;
}

.resize-handle-corner {
  cursor: nwse-resize;
  width: 16px;
  height: 16px;
  bottom: 0;
  right: 0;
}

/* Layout Structure */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 60px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 16px;
}

.search-bar {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

/* Panel Specific Styling */
.player-info-panel {
  min-width: 200px;
  width: 250px;
  max-width: 350px;
}

.chat-container {
  min-width: 300px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.custom-user-panel {
  min-width: 200px;
  width: 250px;
  max-width: 350px;
}

/* Sliding Panel */
.sliding-panel {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 250px;
  z-index: 10;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sliding-panel.open {
  transform: translateX(0);
}

.app-container.sliding-panel-open .main-content {
  padding-left: 250px; /* Width of sliding panel */
}

.app-container.sliding-panel-open .custom-user-panel {
  display: none;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 12px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab.active {
  border-bottom-color: #1976d2;
  font-weight: bold;
}

/* Chat Components */
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-context-toggle {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.context-toggle-button {
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  cursor: pointer;
}

.input-container {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eaeaea;
}

.message-type-toggle {
  width: 80px;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
}

.type-option {
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
}

.type-option.active {
  background-color: #e3f2fd;
}

.input-field {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  min-height: 40px;
  resize: none;
}

.send-button {
  margin-left: 12px;
  padding: 0 16px;
  border-radius: 4px;
  background-color: #1976d2;
  color: white;
  border: none;
  cursor: pointer;
}

/* Color System */
.message-admin-user {
  background-color: #ffebee; /* Light Red */
  color: #c62828; /* Dark Red */
}

.message-admin-ai {
  background-color: #e8f5e9; /* Light Green */
  color: #2e7d32; /* Dark Green */
}

.message-ooc-user {
  background-color: #e3f2fd; /* Light Blue */
  color: #1565c0; /* Dark Blue */
}

.message-ooc-ai {
  background-color: #fff3e0; /* Light Orange */
  color: #e65100; /* Dark Orange */
}

.message-ic-user {
  background-color: #e8f5e9; /* Light Green */
  color: #2e7d32; /* Dark Green */
}

.message-ic-ai {
  background-color: #f3e5f5; /* Light Purple */
  color: #6a1b9a; /* Dark Purple */
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .player-info-panel,
  .custom-user-panel {
    width: 100%;
    max-width: none;
    height: auto;
  }
  
  .app-container.sliding-panel-open .sliding-panel {
    width: 100%;
    height: 100%;
  }
  
  .app-container.sliding-panel-open .main-content {
    padding-left: 0;
    padding-top: 50px; /* Height of a toggle button */
  }
  
  .chat-container {
    order: -1; /* Prioritize chat on mobile */
  }
}
```

## Next Steps for Implementation

1. **Update Component Structure**
   - Create new Board component as a wrapper for all panels
   - Implement standardized padding and styling
   - Update MainLayout to use the three-column structure

2. **Implement Navigation Elements**
   - Create Logo component for the top-left corner
   - Implement PlayerKnowledgeSearch component for the top center
   - Add context-aware search functionality

3. **Enhance Chat Interface**
   - Add ChatContextToggle component
   - Integrate IC/OOC toggle with color indicators
   - Implement color-coded message bubbles based on context

4. **Develop Custom User Panel**
   - Create flexible container for context-dependent information
   - Implement dynamic content loading based on conversation
   - Add toggle for panel visibility on mobile

5. **Responsive Design Implementation**
   - Add media queries for different screen sizes
   - Create collapsible panels for mobile view
   - Ensure touch-friendly controls for mobile users

6. **Testing and Refinement**
   - Test with different content volumes
   - Verify color system accessibility
   - Optimize performance for smooth transitions

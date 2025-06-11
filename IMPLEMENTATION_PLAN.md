# Grid Panel System Implementation Plan

## Tech Stack
- **GridStack.js**: For grid layout, drag & drop, resizing, collision detection
- **Alpine.js**: For reactive panel content and state management
- **Vanilla CSS**: For styling and theming
- **Single HTML file**: No build steps or toolchain required

## Implementation Phases

### Phase 1: Core Grid Setup (Foundation)

#### 1.1 HTML Structure
- Create main container with GridStack initialization
- Define initial grid options (12 columns, row height, etc.)
- Create HTML structure for panel templates
- Add Alpine initialization directives

#### 1.2 Grid Configuration
- Configure GridStack with 12-column layout
- Set up row height and vertical spacing
- Configure static grid (no automatic positioning)
- Define minimum widget size (2x2)

#### 1.3 Base Panel Structure
- Create panel container template with:
  - Header (drag handle)
  - Content area
  - Resize handles
  - Panel controls (close, minimize, maximize)
- Apply base styling for panels and handles

#### 1.4 Grid Visualization
- Implement grid background lines
- Add column/row identifiers (1-12, A-F)
- Create visual debugging tools to show grid cells

### Phase 2: Panel Management System

#### 2.1 Panel State Management
- Create Alpine data model for panel configuration
- Track panel positions, sizes, and content
- Implement serialization/deserialization of panel layout

#### 2.2 Panel Types & Templates
- Define different panel types (chat, info, controls, etc.)
- Create templates for different content types
- Implement unique styling per panel type

#### 2.3 Panel Registry System
- Track all active panels and their grid positions
- Maintain cell occupancy map (which cells are filled)
- Implement collision detection verification

#### 2.4 Panel Creation & Removal
- Panel creation API with type selection
- Panel removal with animation
- Position calculation for new panels

### Phase 3: Interaction & Behavior

#### 3.1 Grid Cell Snapping
- Ensure panels snap to grid cells correctly
- Implement conversion between pixel coordinates and grid cells
- Test edge cases with different panel sizes and positions

#### 3.2 Resize Constraints
- Enforce 2x2 minimum size constraint
- Handle resize behavior to snap to grid lines
- Implement resize only when cursor reaches next grid line
- Block resize if it would cause panel collision

#### 3.3 Drag & Drop Enhancements
- Implement visual feedback during drag operations
- Show shadow/outline of valid drop locations
- Highlight collision issues during drag
- Add animations for smoother UX

#### 3.4 Panel Interaction States
- Define visual states for:
  - Normal panel
  - Panel being dragged
  - Panel being resized
  - Active/focused panel
  - Minimized panel
  - Collision state

### Phase 4: Data & State Persistence

#### 4.1 Layout Persistence
- Save panel layout to localStorage
- Implement layout restoration on page load
- Handle layout migration if schema changes

#### 4.2 Panel Content Persistence
- Store panel content separately from layout
- Implement content save/load mechanisms
- Handle different content types appropriately

#### 4.3 User Preferences
- Store user grid preferences (show/hide grid lines, animations, etc.)
- Create settings panel for customizing grid behavior
- Allow preset layouts to be saved/loaded

### Phase 5: Performance & Polish

#### 5.1 Animation & Transitions
- Add smooth transitions for panel movements
- Implement animation timing functions for natural feel
- Optimize animations for performance

#### 5.2 Performance Optimization
- Debounce resize events
- Lazy load panel content when possible
- Optimize DOM manipulations during drag operations

#### 5.3 Accessibility Improvements
- Add keyboard navigation for panels
- Implement ARIA attributes for draggable elements
- Ensure proper focus management

#### 5.4 Final Polish
- Add subtle shadows and borders for better visual hierarchy
- Implement consistent color scheme
- Add tooltips and help text

## File Structure

```
/
├── index.html            # Main SPA HTML file
├── css/
│   ├── grid-system.css   # Grid styling & visualization
│   ├── panels.css        # Panel styles and states
│   └── theme.css         # Color schemes and theming
├── js/
│   ├── grid-config.js    # GridStack configuration
│   ├── panel-manager.js  # Panel creation and management
│   └── persistence.js    # Saving/loading layout
└── assets/
    └── icons/            # UI icons for panel controls
```

## Data Models

### Panel Configuration Object
```javascript
{
  id: "panel-1",
  type: "chat",
  title: "Chat Panel",
  position: {
    x: 0,       // Column (0-based)
    y: 0,       // Row (0-based)
    w: 3,       // Width in columns
    h: 2        // Height in rows
  },
  content: {
    // Panel-specific content
  },
  state: "normal", // normal, minimized, maximized
  zIndex: 10,     // For stacking order
  locked: false   // Prevent moving/resizing
}
```

### Grid Occupancy Map
```javascript
{
  // Format: "columnRow": "panelId"
  "1A": "panel-1",
  "1B": "panel-1",
  "2A": "panel-1",
  "2B": "panel-1",
  // etc.
}
```

## Implementation Details

### GridStack Configuration
```javascript
const grid = GridStack.init({
  column: 12,
  cellHeight: 80,
  margin: 5,
  float: false,
  disableOneColumnMode: true,
  staticGrid: false,
  minRow: 6,
  disableResize: false,
  disableDrag: false
});
```

### Alpine Panel Management
```javascript
document.addEventListener('alpine:init', () => {
  Alpine.data('panelManager', () => ({
    panels: [],
    gridOccupancy: {},
    
    init() {
      // Initialize panel system
      this.loadSavedLayout();
    },
    
    addPanel(type, title, x, y, w, h) {
      // Generate unique ID
      // Check if position is valid
      // Create new panel
      // Update occupancy map
    },
    
    removePanel(id) {
      // Remove panel
      // Update occupancy map
    },
    
    // Other methods...
  }));
});
```

### Grid Cell Calculation Functions
```javascript
function gridCellToPosition(cell) {
  // Convert "4C" to {x: 3, y: 2} (0-indexed)
  const x = parseInt(cell.match(/\d+/)[0]) - 1;
  const y = cell.charCodeAt(cell.length - 1) - 'A'.charCodeAt(0);
  return { x, y };
}

function positionToGridCell(x, y) {
  // Convert {x: 3, y: 2} to "4C" (1-indexed for display)
  return `${x + 1}${String.fromCharCode('A'.charCodeAt(0) + y)}`;
}
```

## Testing Strategy

1. **Unit Testing**:
   - Test grid cell calculations
   - Test panel collision detection
   - Test layout serialization/deserialization

2. **Integration Testing**:
   - Test panel drag and drop behavior
   - Test resize constraints
   - Test panel content with Alpine reactivity

3. **User Testing Scenarios**:
   - Create multiple panels and arrange them
   - Resize panels to ensure grid snapping works
   - Test collision prevention
   - Verify layout persists after page refresh

## Milestone Schedule

1. **Milestone 1**: Basic grid with static panels
   - HTML structure
   - GridStack initialization
   - Visual grid with identifiers
   
2. **Milestone 2**: Drag and drop functionality
   - Panel movement with grid snapping
   - Collision detection
   - Visual feedback

3. **Milestone 3**: Resize functionality
   - Grid line snapping during resize
   - Minimum size constraints
   - Resize cancellation on collision

4. **Milestone 4**: Panel content and state
   - Alpine reactive content
   - Panel types and templates
   - State persistence

5. **Milestone 5**: Polish and optimization
   - Animations and transitions
   - Performance improvements
   - Final styling

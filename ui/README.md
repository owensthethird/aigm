# AI Game Master - Grid Dashboard Prototype

A functional grid-based dashboard system prototype for the AI Game Master platform. This implementation is based on the functional programming design principles and provides an interactive, drag-and-drop panel system.

## Features

- **Drag & Drop**: Smooth panel dragging with real-time position updates
- **Smart Collision Detection**: Intelligent handling of occupied spaces  
- **Penetration Collapse**: Panels automatically resize when moved into tight spaces
- **Resize Handles**: Functional resize capability with collision detection
- **Visual Feedback**: Drop previews with different states (valid/invalid/resized)
- **Debug Mode**: Comprehensive debugging information during interactions
- **Persistence**: Save/load layout functionality
- **Smart Sizing**: Automatic size optimization based on available space

## Getting Started

### Prerequisites

- Node.js (for the development server)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

This will start a local HTTP server on port 7777 and automatically open the dashboard in your browser.

### Alternative Serving Methods

You can also serve the HTML file directly:

```bash
# Using npm
npm run serve

# Using Python (if available)
python -m http.server 7777

# Or simply open public/index.html in your browser
```

## Usage

### Basic Operations

1. **Drag Panels**: Click and drag the panel header to move panels around
2. **Resize Panels**: Use the resize handle in the bottom-right corner  
3. **Add Panels**: Click "Add Panel" to create new panels
4. **Save/Load**: Use the save/load buttons to persist your layout
5. **Clear All**: Remove all panels and start fresh
6. **Debug Mode**: Toggle debug information for development

### Panel Features

- **Smart Collision Avoidance**: Panels automatically adjust size when moved into occupied spaces
- **Penetration Collapse**: Advanced size reduction based on movement direction
- **Visual Previews**: See exactly where panels will be placed before dropping
- **Minimum Size Constraints**: Panels maintain minimum usable sizes

## Grid Configuration

The grid system uses a 12x6 cell layout by default. This can be modified in the CSS variables:

```css
:root {
    --columns: 12;
    --rows: 6;
    --gap: 8px;
}
```

## Implementation Details

This prototype implements:

- **Functional Programming Principles**: Pure functions for calculations
- **Immutable State Patterns**: Predictable state management  
- **Smart Layout Algorithms**: Collision detection and space optimization
- **Event-Driven Architecture**: Clean separation of concerns
- **Performance Optimizations**: Efficient DOM updates and calculations

## File Structure

```
ui/
├── public/
│   ├── index.html          # Complete grid system implementation
│   └── manifest.json       # Web app manifest
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Development

The entire grid system is implemented in a single HTML file (`public/index.html`) containing:

- CSS for styling and layout
- JavaScript for functionality and event handling
- Complete functional grid panel system
- Sample data and panels

This makes it easy to understand, modify, and integrate into larger applications.

## Next Steps

This prototype serves as the foundation for:

1. Integration with the AI Game Master backend
2. Addition of gaming-specific panel types
3. Real-time multiplayer functionality  
4. Enhanced accessibility features
5. Mobile responsiveness
6. Custom theming and branding

## Browser Compatibility

- Modern browsers supporting CSS Grid
- ES6+ JavaScript features  
- No framework dependencies

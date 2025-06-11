// Grid Configuration
const GRID_CONFIG = {
    columns: 12,
    rows: 6,
    gap: 8,
    minSize: { width: 2, height: 1 }
};

// Panel Internal Grid Configuration
const PANEL_GRID_CONFIG = {
    subdivisions: 2, // Subdivide each main grid cell into 2x2 subgrid
    gap: 2,          // Gap between elements in pixels (smaller for subgrid)
    minElementSize: { width: 1, height: 1 },
    // Grid size is calculated based on panel size: panelSize * subdivisions
    // Fixed sizing configuration
    cellAspectRatio: 1.0,  // 1:1 aspect ratio for grid cells
    baseElementSize: 24,   // Base size in pixels for a 1x1 element
    preventStretching: true // Use fixed dimensions instead of grid stretching
};

// Application Settings
const APP_CONFIG = {
    storageKey: 'gridLayout',
    version: '1.0'
};

// Panel Type Configurations
const PANEL_TYPES = {
    CHAT: 'chat',
    CHARACTER: 'character', 
    DICE: 'dice',
    STATUS: 'status',
    NOTES: 'notes'
};

// Default panel sizes for each type
const DEFAULT_PANEL_SIZES = {
    [PANEL_TYPES.CHAT]: { width: 4, height: 4 },
    [PANEL_TYPES.CHARACTER]: { width: 3, height: 5 },
    [PANEL_TYPES.DICE]: { width: 2, height: 3 },
    [PANEL_TYPES.STATUS]: { width: 3, height: 2 },
    [PANEL_TYPES.NOTES]: { width: 4, height: 3 }
};

// Panel icons (using text for now, can be replaced with actual icons)
const PANEL_ICONS = {
    [PANEL_TYPES.CHAT]: '💬',
    [PANEL_TYPES.CHARACTER]: '🎭',
    [PANEL_TYPES.DICE]: '🎲',
    [PANEL_TYPES.STATUS]: '📊',
    [PANEL_TYPES.NOTES]: '📝'
};

// Panel Element Types
const PANEL_ELEMENT_TYPES = {
    TEXT: 'text',
    BUTTON: 'button',
    INPUT: 'input',
    STAT_BLOCK: 'stat-block',
    STATUS_INDICATOR: 'status-indicator',
    IMAGE: 'image',
    SEPARATOR: 'separator',
    CONTAINER: 'container'
}; 
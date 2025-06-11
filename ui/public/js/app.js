// Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Game Master - Modular Panel System');
    console.log('Panel Types Available:', Object.values(PANEL_TYPES));
    
    // Initialize the grid dashboard
    window.dashboard = new GridDashboard();
    
    console.log('Dashboard initialized with', window.dashboard.panels.length, 'sample panels');
});

// Testing utility function (temporary)
window.toggleStretchMode = function() {
    PANEL_GRID_CONFIG.preventStretching = !PANEL_GRID_CONFIG.preventStretching;
    console.log('Stretch prevention:', PANEL_GRID_CONFIG.preventStretching ? 'ENABLED (Fixed sizing)' : 'DISABLED (CSS Grid)');
    
    // Refresh all panels with internal grids
    dashboard.panels.forEach(panel => {
        if (panel.gridManager) {
            panel.gridManager.setupGridStyles();
            if (PANEL_GRID_CONFIG.preventStretching) {
                panel.gridManager.refreshElementPositions();
            } else {
                // Switch back to CSS Grid mode
                panel.gridManager.elements.forEach(element => {
                    element.element.style.position = '';
                    element.element.style.left = '';
                    element.element.style.top = '';
                    element.element.style.width = '';
                    element.element.style.height = '';
                    element.updateGridPosition();
                });
            }
        }
    });
}; 
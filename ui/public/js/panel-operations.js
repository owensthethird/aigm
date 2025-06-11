// ================================================
// PANEL OPERATIONS
// ================================================

function createPanel(id, origin, size, title, content) {
    return {
        id: String(id),
        origin: { ...origin },
        size: { ...size },
        title: title || `Panel ${id}`,
        content: content || `Content for panel ${id}`
    };
}

function updatePanelInArray(panels, panelId, newOrigin, newSize) {
    return panels.map(panel => 
        panel.id === panelId 
            ? { ...panel, origin: newOrigin, size: newSize }
            : panel
    );
}

function calculatePanelPosition(
    mousePosition, gridRect, cellDimensions, dragOffset, initialOrigin, initialArea,
    lastValidOrigin, allPanels, excludePanelId, gridConfig, minSize = { width: 2, height: 1 }
) {
    const rawCursorPosition = getCursorGridPosition(
        mousePosition.x, mousePosition.y, gridRect, 
        cellDimensions.width, cellDimensions.height, dragOffset
    );
    
    const hypotheticalOrigin = {
        col: Math.max(0, Math.min(rawCursorPosition.col, gridConfig.columns - 1)),
        row: Math.max(0, Math.min(rawCursorPosition.row, gridConfig.rows - 1))
    };
    
    const movementDirection = getMovementDirection(initialOrigin, hypotheticalOrigin);
    
    if (!hasEdgeCollisions(hypotheticalOrigin, initialArea, allPanels, excludePanelId, gridConfig)) {
        return {
            isValid: true,
            origin: hypotheticalOrigin,
            size: initialArea,
            displayOrigin: hypotheticalOrigin,
            displaySize: initialArea,
            isResized: false,
            newValidOrigin: hypotheticalOrigin
        };
    }
    
    const targetCollapsedArea = collapseFromLeadingEdge(
        hypotheticalOrigin, initialArea, movementDirection,
        allPanels, excludePanelId, gridConfig, minSize
    );
    
    if (targetCollapsedArea) {
        return {
            isValid: true,
            origin: hypotheticalOrigin,
            size: targetCollapsedArea,
            displayOrigin: hypotheticalOrigin,
            displaySize: targetCollapsedArea,
            isResized: true,
            movementDirection,
            newValidOrigin: hypotheticalOrigin
        };
    }
    
    // Fallback to penetration collapse at last valid position
    const fallbackOrigin = lastValidOrigin || initialOrigin;
    const penetrationData = calculatePenetrationDepth(hypotheticalOrigin, fallbackOrigin);
    
    const penetrationCollapsedArea = applyPenetrationCollapse(
        fallbackOrigin, initialArea, penetrationData, minSize
    );
    
    if (!hasEdgeCollisions(fallbackOrigin, penetrationCollapsedArea, allPanels, excludePanelId, gridConfig)) {
        return {
            isValid: true,
            origin: fallbackOrigin,
            size: penetrationCollapsedArea,
            displayOrigin: fallbackOrigin,
            displaySize: penetrationCollapsedArea,
            isResized: true,
            isPenetrationCollapse: true,
            penetrationData: penetrationData,
            movementDirection
        };
    }
    
    const furtherCollapsedArea = collapseFromLeadingEdge(
        fallbackOrigin, penetrationCollapsedArea, movementDirection,
        allPanels, excludePanelId, gridConfig, minSize
    );
    
    if (furtherCollapsedArea) {
        return {
            isValid: true,
            origin: fallbackOrigin,
            size: furtherCollapsedArea,
            displayOrigin: fallbackOrigin,
            displaySize: furtherCollapsedArea,
            isResized: true,
            isPenetrationCollapse: true,
            penetrationData: penetrationData,
            movementDirection
        };
    }
    
    return {
        isValid: false,
        reason: 'NO_SPACE_AVAILABLE',
        origin: hypotheticalOrigin,
        size: initialArea
    };
} 
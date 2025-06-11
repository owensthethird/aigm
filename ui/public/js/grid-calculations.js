// ================================================
// GRID CALCULATION FUNCTIONS
// ================================================

function getCursorGridPosition(mouseX, mouseY, gridRect, cellWidth, cellHeight, dragOffset) {
    const relativeX = mouseX - gridRect.left - dragOffset.x;
    const relativeY = mouseY - gridRect.top - dragOffset.y;
    
    return {
        col: Math.round(relativeX / cellWidth),
        row: Math.round(relativeY / cellHeight)
    };
}

function isOriginOccupied(origin, allPanels, excludePanelId) {
    return allPanels.some(panel => {
        if (panel.id === excludePanelId) return false;
        
        return origin.col >= panel.origin.col && 
               origin.col < panel.origin.col + panel.size.width &&
               origin.row >= panel.origin.row && 
               origin.row < panel.origin.row + panel.size.height;
    });
}

function calculatePenetrationDepth(hypotheticalOrigin, actualOrigin) {
    return {
        colPenetration: Math.abs(hypotheticalOrigin.col - actualOrigin.col),
        rowPenetration: Math.abs(hypotheticalOrigin.row - actualOrigin.row),
        hasColDifference: hypotheticalOrigin.col !== actualOrigin.col,
        hasRowDifference: hypotheticalOrigin.row !== actualOrigin.row
    };
}

function applyPenetrationCollapse(fallbackOrigin, initialArea, penetrationData, minSize) {
    let collapsedArea = { ...initialArea };
    
    if (penetrationData.hasColDifference && penetrationData.colPenetration > 0) {
        collapsedArea.width = Math.max(minSize.width, initialArea.width - penetrationData.colPenetration);
    }
    
    if (penetrationData.hasRowDifference && penetrationData.rowPenetration > 0) {
        collapsedArea.height = Math.max(minSize.height, initialArea.height - penetrationData.rowPenetration);
    }
    
    return collapsedArea;
}

function hasEdgeCollisions(origin, area, allPanels, excludePanelId, gridConfig) {
    if (origin.col < 0 || origin.row < 0 || 
        origin.col + area.width > gridConfig.columns ||
        origin.row + area.height > gridConfig.rows) {
        return true;
    }
    
    for (let col = origin.col; col < origin.col + area.width; col++) {
        for (let row = origin.row; row < origin.row + area.height; row++) {
            if (isCellOccupied(col, row, allPanels, excludePanelId)) {
                return true;
            }
        }
    }
    
    return false;
}

function isCellOccupied(col, row, allPanels, excludePanelId) {
    return allPanels.some(panel => {
        if (panel.id === excludePanelId) return false;
        
        return col >= panel.origin.col && 
               col < panel.origin.col + panel.size.width &&
               row >= panel.origin.row && 
               row < panel.origin.row + panel.size.height;
    });
}

function getMovementDirection(initialOrigin, hypotheticalOrigin) {
    const deltaCol = hypotheticalOrigin.col - initialOrigin.col;
    const deltaRow = hypotheticalOrigin.row - initialOrigin.row;
    
    if (Math.abs(deltaCol) > Math.abs(deltaRow)) {
        return deltaCol > 0 ? 'RIGHT' : 'LEFT';
    } else {
        return deltaRow > 0 ? 'DOWN' : 'UP';
    }
}

function collapseFromLeadingEdge(origin, initialArea, movementDirection, allPanels, excludePanelId, gridConfig, minSize) {
    let hypotheticalArea = { ...initialArea };
    
    switch(movementDirection) {
        case 'LEFT':
        case 'RIGHT':
            while (hypotheticalArea.width >= minSize.width) {
                if (!hasEdgeCollisions(origin, hypotheticalArea, allPanels, excludePanelId, gridConfig)) {
                    return hypotheticalArea;
                }
                hypotheticalArea.width--;
            }
            break;
            
        case 'UP':
        case 'DOWN':
            while (hypotheticalArea.height >= minSize.height) {
                if (!hasEdgeCollisions(origin, hypotheticalArea, allPanels, excludePanelId, gridConfig)) {
                    return hypotheticalArea;
                }
                hypotheticalArea.height--;
            }
            break;
    }
    
    return null;
}

function findEmptySpace(allPanels, gridConfig, desiredSize = { width: 2, height: 2 }) {
    for (let row = 0; row <= gridConfig.rows - desiredSize.height; row++) {
        for (let col = 0; col <= gridConfig.columns - desiredSize.width; col++) {
            const testOrigin = { col, row };
            if (!hasEdgeCollisions(testOrigin, desiredSize, allPanels, null, gridConfig)) {
                return testOrigin;
            }
        }
    }
    return null;
} 
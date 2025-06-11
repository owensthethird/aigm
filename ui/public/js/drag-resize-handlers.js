// ================================================
// DRAG AND RESIZE HANDLERS
// ================================================

function handlePanelDrag(mouseEvent, dragContext) {
    const result = calculatePanelPosition(
        { x: mouseEvent.clientX, y: mouseEvent.clientY },
        dragContext.gridRect, dragContext.cellDimensions, dragContext.dragOffset,
        dragContext.initialOrigin, dragContext.initialArea, dragContext.lastValidOrigin,
        dragContext.allPanels, dragContext.panelId, dragContext.gridConfig
    );
    
    return {
        origin: result.origin,
        size: result.size,
        isValid: result.isValid,
        isResized: result.isResized,
        canDrop: result.isValid,
        reason: result.reason,
        movementDirection: result.movementDirection,
        isPenetrationCollapse: result.isPenetrationCollapse,
        penetrationData: result.penetrationData,
        newValidOrigin: result.newValidOrigin,
        displayOrigin: result.displayOrigin,
        displaySize: result.displaySize
    };
}

function handlePanelRelease(dragResult, allPanels, panelId) {
    if (dragResult.canDrop) {
        const storeOrigin = dragResult.displayOrigin || dragResult.origin;
        const storeSize = dragResult.displaySize || dragResult.size;
        
        return updatePanelInArray(allPanels, panelId, storeOrigin, storeSize);
    } else {
        return allPanels;
    }
}

function calculateHypotheticalResizeOrigin(mousePosition, gridRect, cellDimensions) {
    const relativeX = mousePosition.x - gridRect.left;
    const relativeY = mousePosition.y - gridRect.top;
    
    const mouseCol = relativeX / cellDimensions.width;
    const mouseRow = relativeY / cellDimensions.height;
    
    return {
        col: Math.round(mouseCol),
        row: Math.round(mouseRow)
    };
}

function calculateHypotheticalSize(panelOrigin, hypotheticalResizeOrigin, minSize, gridConfig) {
    let hypotheticalWidth = hypotheticalResizeOrigin.col - panelOrigin.col;
    let hypotheticalHeight = hypotheticalResizeOrigin.row - panelOrigin.row;
    
    hypotheticalWidth = Math.max(minSize.width, hypotheticalWidth);
    hypotheticalHeight = Math.max(minSize.height, hypotheticalHeight);
    
    const maxWidth = gridConfig.columns - panelOrigin.col;
    const maxHeight = gridConfig.rows - panelOrigin.row;
    hypotheticalWidth = Math.min(hypotheticalWidth, maxWidth);
    hypotheticalHeight = Math.min(hypotheticalHeight, maxHeight);
    
    return { width: hypotheticalWidth, height: hypotheticalHeight };
}

function applyResizeCollisionLogic(panelOrigin, hypotheticalSize, allPanels, excludePanelId, gridConfig, lastValidSize) {
    if (!hasEdgeCollisions(panelOrigin, hypotheticalSize, allPanels, excludePanelId, gridConfig)) {
        return {
            size: hypotheticalSize,
            isValid: true,
            isCollapsed: false,
            collapseType: null
        };
    }
    
    let collapsedWidth = hypotheticalSize.width;
    while (collapsedWidth >= 1) {
        const widthCollapsedSize = { width: collapsedWidth, height: hypotheticalSize.height };
        if (!hasEdgeCollisions(panelOrigin, widthCollapsedSize, allPanels, excludePanelId, gridConfig)) {
            return {
                size: widthCollapsedSize,
                isValid: true,
                isCollapsed: true,
                collapseType: 'WIDTH'
            };
        }
        collapsedWidth--;
    }
    
    let collapsedHeight = hypotheticalSize.height;
    while (collapsedHeight >= 1) {
        const heightCollapsedSize = { width: hypotheticalSize.width, height: collapsedHeight };
        if (!hasEdgeCollisions(panelOrigin, heightCollapsedSize, allPanels, excludePanelId, gridConfig)) {
            return {
                size: heightCollapsedSize,
                isValid: true,
                isCollapsed: true,
                collapseType: 'HEIGHT'
            };
        }
        collapsedHeight--;
    }
    
    for (let w = hypotheticalSize.width; w >= 1; w--) {
        for (let h = hypotheticalSize.height; h >= 1; h--) {
            const bothCollapsedSize = { width: w, height: h };
            if (!hasEdgeCollisions(panelOrigin, bothCollapsedSize, allPanels, excludePanelId, gridConfig)) {
                return {
                    size: bothCollapsedSize,
                    isValid: true,
                    isCollapsed: true,
                    collapseType: 'BOTH'
                };
            }
        }
    }
    
    return {
        size: lastValidSize,
        isValid: false,
        isCollapsed: false,
        collapseType: 'FALLBACK',
        reason: 'NO_VALID_SIZE'
    };
}

function handlePanelResize(mouseEvent, resizeContext) {
    const hypotheticalResizeOrigin = calculateHypotheticalResizeOrigin(
        { x: mouseEvent.clientX, y: mouseEvent.clientY },
        resizeContext.gridRect, resizeContext.cellDimensions
    );
    
    const hypotheticalSize = calculateHypotheticalSize(
        resizeContext.panelOrigin, hypotheticalResizeOrigin,
        resizeContext.minSize, resizeContext.gridConfig
    );
    
    const collisionResult = applyResizeCollisionLogic(
        resizeContext.panelOrigin, hypotheticalSize, resizeContext.allPanels,
        resizeContext.panelId, resizeContext.gridConfig, resizeContext.lastValidSize
    );
    
    return {
        panelOrigin: resizeContext.panelOrigin,
        hypotheticalResizeOrigin: hypotheticalResizeOrigin,
        hypotheticalSize: hypotheticalSize,
        size: collisionResult.size,
        isValid: collisionResult.isValid,
        canDrop: true,
        isResize: true,
        isCollapsed: collisionResult.isCollapsed,
        collapseType: collisionResult.collapseType,
        reason: collisionResult.reason
    };
}

function handleResizeRelease(resizeResult, allPanels, panelId) {
    return updatePanelInArray(allPanels, panelId, resizeResult.panelOrigin, resizeResult.size);
} 
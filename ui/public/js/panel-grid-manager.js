// Panel Grid Manager - Handles internal grid layout within panels
class PanelGridManager {
    constructor(panel) {
        this.panel = panel;
        // Calculate subgrid dimensions: panel size * subdivisions
        this.cols = panel.size.width * PANEL_GRID_CONFIG.subdivisions;
        this.rows = panel.size.height * PANEL_GRID_CONFIG.subdivisions;
        this.elements = [];
        this.elementCounter = 0;
        this.gridContainer = null;
        this.isEditMode = false;
        this.dragContext = null;
    }

    initializeGrid(contentContainer) {
        // Create internal grid container
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'panel-internal-grid';
        this.setupGridStyles();
        
        contentContainer.appendChild(this.gridContainer);
        
        // Setup resize observer for fixed positioning mode
        if (PANEL_GRID_CONFIG.preventStretching) {
            this.setupResizeObserver();
        }
        
        return this.gridContainer;
    }

    setupGridStyles() {
        if (!this.gridContainer) return;
        
        const gap = PANEL_GRID_CONFIG.gap;
        
        if (PANEL_GRID_CONFIG.preventStretching) {
            // Use fixed positioning with calculated cell size
            const cellSize = this.calculateCellSize();
            
            this.gridContainer.style.cssText = `
                display: block;
                position: relative;
                height: 100%;
                overflow: hidden;
                padding: 4px;
                ${this.isEditMode ? 'background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);' : ''}
            `;
            
            // Set CSS custom properties for grid visualization
            this.gridContainer.style.setProperty('--grid-cols', this.cols);
            this.gridContainer.style.setProperty('--grid-rows', this.rows);
            this.gridContainer.style.setProperty('--cell-size', `${cellSize}px`);
            this.gridContainer.style.setProperty('--grid-gap', `${gap}px`);
        } else {
            // Original CSS Grid approach
            this.gridContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.cols}, 1fr);
                grid-template-rows: repeat(${this.rows}, 1fr);
                gap: ${gap}px;
                padding: 4px;
                height: 100%;
                overflow: hidden;
                position: relative;
                ${this.isEditMode ? 'background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);' : ''}
            `;
        }
    }

    calculateCellSize() {
        if (!this.gridContainer) return PANEL_GRID_CONFIG.baseElementSize;
        
        const containerRect = this.gridContainer.getBoundingClientRect();
        const availableWidth = containerRect.width - 8; // Account for padding
        const availableHeight = containerRect.height - 8;
        
        // Calculate cell size based on available space and maintaining aspect ratio
        const cellWidth = (availableWidth - (this.cols - 1) * PANEL_GRID_CONFIG.gap) / this.cols;
        const cellHeight = (availableHeight - (this.rows - 1) * PANEL_GRID_CONFIG.gap) / this.rows;
        
        // Use the smaller dimension to maintain aspect ratio
        const cellSize = Math.min(cellWidth, cellHeight / PANEL_GRID_CONFIG.cellAspectRatio);
        
        return Math.max(PANEL_GRID_CONFIG.baseElementSize, cellSize);
    }

    addElement(type, gridPos, gridSize, data = {}) {
        // Check if position is available
        if (!this.isPositionAvailable(gridPos, gridSize)) {
            // Find next available position
            gridPos = this.findNextAvailablePosition(gridSize);
            if (!gridPos) {
                console.warn('No space available for element');
                return null;
            }
        }

        const element = PanelElementFactory.createElement(
            type, 
            ++this.elementCounter, 
            gridPos, 
            gridSize, 
            data
        );

        this.elements.push(element);
        
        if (this.gridContainer) {
            const elementDOM = element.createElement();
            this.setupElementDragHandlers(elementDOM, element);
            this.gridContainer.appendChild(elementDOM);
        }

        return element;
    }

    isPositionAvailable(gridPos, gridSize, excludeElementId = null) {
        const endCol = gridPos.col + gridSize.width;
        const endRow = gridPos.row + gridSize.height;
        
        // Check bounds
        if (endCol > this.cols || endRow > this.rows || gridPos.col < 0 || gridPos.row < 0) {
            return false;
        }

        // Check for collisions with existing elements
        for (let element of this.elements) {
            if (excludeElementId && element.id === excludeElementId) continue;
            
            const elemEndCol = element.gridPos.col + element.gridSize.width;
            const elemEndRow = element.gridPos.row + element.gridSize.height;
            
            // Check for overlap
            if (!(endCol <= element.gridPos.col || 
                  gridPos.col >= elemEndCol || 
                  endRow <= element.gridPos.row || 
                  gridPos.row >= elemEndRow)) {
                return false;
            }
        }
        
        return true;
    }

    findNextAvailablePosition(gridSize) {
        for (let row = 0; row <= this.rows - gridSize.height; row++) {
            for (let col = 0; col <= this.cols - gridSize.width; col++) {
                const testPos = { col, row };
                if (this.isPositionAvailable(testPos, gridSize)) {
                    return testPos;
                }
            }
        }
        return null;
    }

    removeElement(elementId) {
        const elementIndex = this.elements.findIndex(e => e.id === elementId);
        if (elementIndex !== -1) {
            const element = this.elements[elementIndex];
            if (element.element && element.element.parentNode) {
                element.element.parentNode.removeChild(element.element);
            }
            this.elements.splice(elementIndex, 1);
            return true;
        }
        return false;
    }

    moveElement(elementId, newGridPos) {
        const element = this.elements.find(e => e.id === elementId);
        if (!element) return false;

        if (this.isPositionAvailable(newGridPos, element.gridSize, elementId)) {
            element.setPosition(newGridPos.col, newGridPos.row);
            return true;
        }
        return false;
    }

    resizeElement(elementId, newGridSize) {
        const element = this.elements.find(e => e.id === elementId);
        if (!element) return false;

        if (this.isPositionAvailable(element.gridPos, newGridSize, elementId)) {
            element.setSize(newGridSize.width, newGridSize.height);
            return true;
        }
        return false;
    }

    getElementById(elementId) {
        return this.elements.find(e => e.id === elementId);
    }

    getAllElements() {
        return [...this.elements];
    }

    clearElements() {
        this.elements.forEach(element => {
            if (element.element && element.element.parentNode) {
                element.element.parentNode.removeChild(element.element);
            }
        });
        this.elements = [];
        this.elementCounter = 0;
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        clearTimeout(this.resizeTimeout);
    }

    serializeElements() {
        return this.elements.map(element => element.serialize());
    }

    loadElements(serializedElements) {
        this.clearElements();
        
        serializedElements.forEach(elementData => {
            const element = PanelElementFactory.deserializeElement(elementData);
            this.elements.push(element);
            this.elementCounter = Math.max(this.elementCounter, parseInt(element.id));
            
            if (this.gridContainer) {
                const elementDOM = element.createElement();
                this.gridContainer.appendChild(elementDOM);
            }
        });
    }

    refreshGrid() {
        if (!this.gridContainer) return;
        
        // Clear and recreate all elements
        this.gridContainer.innerHTML = '';
        this.elements.forEach(element => {
            const elementDOM = element.createElement();
            this.gridContainer.appendChild(elementDOM);
        });
    }

    // Edit Mode and Drag-and-Drop functionality
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.setupGridStyles();
        
        // Update element interaction states
        this.elements.forEach(element => {
            if (element.element) {
                element.element.style.cursor = this.isEditMode ? 'grab' : 'default';
                element.element.style.outline = this.isEditMode ? '1px dashed rgba(59, 130, 246, 0.3)' : 'none';
            }
        });
        
        return this.isEditMode;
    }

    setupElementDragHandlers(elementDOM, element) {
        if (!elementDOM) return;
        
        elementDOM.addEventListener('mousedown', (e) => {
            if (!this.isEditMode) return;
            this.startElementDrag(e, element);
        });
    }

    startElementDrag(e, element) {
        if (!this.isEditMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const gridRect = this.gridContainer.getBoundingClientRect();
        const elementRect = element.element.getBoundingClientRect();
        
        this.dragContext = {
            element: element,
            initialPos: { ...element.gridPos },
            initialSize: { ...element.gridSize },
            gridRect: gridRect,
            cellWidth: gridRect.width / this.cols,
            cellHeight: gridRect.height / this.rows,
            dragOffset: {
                x: e.clientX - elementRect.left,
                y: e.clientY - elementRect.top
            }
        };
        
        element.element.style.zIndex = '1000';
        element.element.style.cursor = 'grabbing';
        element.element.classList.add('dragging');
        
        // Add global mouse handlers
        document.addEventListener('mousemove', this.handleElementDrag.bind(this));
        document.addEventListener('mouseup', this.handleElementDragEnd.bind(this));
    }

    handleElementDrag(e) {
        if (!this.dragContext) return;
        
        const { gridRect, cellWidth, cellHeight, dragOffset } = this.dragContext;
        const relativeX = e.clientX - gridRect.left - dragOffset.x;
        const relativeY = e.clientY - gridRect.top - dragOffset.y;
        
        // Calculate grid position
        const newCol = Math.round(relativeX / cellWidth);
        const newRow = Math.round(relativeY / cellHeight);
        
        // Constrain to grid bounds
        const constrainedCol = Math.max(0, Math.min(this.cols - this.dragContext.element.gridSize.width, newCol));
        const constrainedRow = Math.max(0, Math.min(this.rows - this.dragContext.element.gridSize.height, newRow));
        
        const newPos = { col: constrainedCol, row: constrainedRow };
        
        // Check if position is valid (no collision)
        const isValid = this.isPositionAvailable(newPos, this.dragContext.element.gridSize, this.dragContext.element.id);
        
        // Update visual position
        this.dragContext.element.gridPos = newPos;
        this.dragContext.element.updateGridPosition();
        
        // Visual feedback
        this.dragContext.element.element.style.opacity = isValid ? '1' : '0.5';
        this.dragContext.element.element.style.border = isValid ? '2px solid #3b82f6' : '2px solid #ef4444';
    }

    handleElementDragEnd(e) {
        if (!this.dragContext) return;
        
        const element = this.dragContext.element;
        const isValid = this.isPositionAvailable(element.gridPos, element.gridSize, element.id);
        
        if (!isValid) {
            // Revert to original position
            element.gridPos = { ...this.dragContext.initialPos };
            element.updateGridPosition();
        }
        
        // Reset styles
        element.element.style.zIndex = '';
        element.element.style.cursor = this.isEditMode ? 'grab' : 'default';
        element.element.style.opacity = '1';
        element.element.style.border = '';
        element.element.classList.remove('dragging');
        
        // Remove global handlers
        document.removeEventListener('mousemove', this.handleElementDrag.bind(this));
        document.removeEventListener('mouseup', this.handleElementDragEnd.bind(this));
        
        this.dragContext = null;
    }

    // Panel resize handler - update subgrid when panel is resized
    updatePanelSize(newSize) {
        // Recalculate subgrid dimensions
        this.cols = newSize.width * PANEL_GRID_CONFIG.subdivisions;
        this.rows = newSize.height * PANEL_GRID_CONFIG.subdivisions;
        
        // Update grid styles
        this.setupGridStyles();
        
        // Refresh all element positions if using fixed positioning
        if (PANEL_GRID_CONFIG.preventStretching) {
            this.refreshElementPositions();
        }
        
        // Check if any elements are now out of bounds and reposition them
        this.elements.forEach(element => {
            const maxCol = this.cols - element.gridSize.width;
            const maxRow = this.rows - element.gridSize.height;
            
            if (element.gridPos.col > maxCol || element.gridPos.row > maxRow) {
                const newPos = this.findNextAvailablePosition(element.gridSize);
                if (newPos) {
                    element.setPosition(newPos.col, newPos.row);
                } else {
                    // Remove element if no space available
                    this.removeElement(element.id);
                }
            }
        });
    }

    refreshElementPositions() {
        if (!PANEL_GRID_CONFIG.preventStretching) return;
        
        // Recalculate cell size
        const cellSize = this.calculateCellSize();
        this.gridContainer.style.setProperty('--cell-size', `${cellSize}px`);
        
        // Update all element positions
        this.elements.forEach(element => {
            element.updateGridPosition();
        });
    }

    getGridStats() {
        return {
            cols: this.cols,
            rows: this.rows,
            totalCells: this.cols * this.rows,
            usedCells: this.elements.reduce((sum, el) => sum + (el.gridSize.width * el.gridSize.height), 0),
            elementCount: this.elements.length,
            isEditMode: this.isEditMode,
            subdivisions: PANEL_GRID_CONFIG.subdivisions
        };
    }

    setupResizeObserver() {
        if (!this.gridContainer || !window.ResizeObserver) return;
        
        this.resizeObserver = new ResizeObserver((entries) => {
            // Debounce the resize handler
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.refreshElementPositions();
            }, 100);
        });
        
        this.resizeObserver.observe(this.gridContainer);
    }
} 
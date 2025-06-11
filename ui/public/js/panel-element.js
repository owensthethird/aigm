// Panel Element System - Grid-based elements within panels
class PanelElement {
    constructor(id, type, gridPos, gridSize, data = {}) {
        this.id = String(id);
        this.type = type;
        this.gridPos = { ...gridPos }; // { col, row } position in panel grid
        this.gridSize = { ...gridSize }; // { width, height } in grid cells
        this.data = { ...data };
        this.element = null;
        this.constraints = {
            minSize: { width: 1, height: 1 },
            maxSize: { width: 6, height: 4 },
            resizable: true,
            draggable: true
        };
    }

    createElement() {
        const element = document.createElement('div');
        element.className = `panel-element ${this.type}-element`;
        element.dataset.elementId = this.id;
        element.dataset.elementType = this.type;
        
        this.updateGridPosition(element);
        this.renderContent(element);
        
        this.element = element;
        return element;
    }

    updateGridPosition(element = this.element) {
        if (!element) return;
        
        if (PANEL_GRID_CONFIG.preventStretching) {
            // Use fixed positioning with calculated dimensions
            this.updateFixedPosition(element);
        } else {
            // Original CSS Grid approach
            const startCol = this.gridPos.col + 1;
            const endCol = startCol + this.gridSize.width;
            const startRow = this.gridPos.row + 1;
            const endRow = startRow + this.gridSize.height;
            
            element.style.gridColumn = `${startCol} / ${endCol}`;
            element.style.gridRow = `${startRow} / ${endRow}`;
        }
    }

    updateFixedPosition(element) {
        const cellSize = this.calculateElementCellSize();
        const gap = PANEL_GRID_CONFIG.gap;
        
        // Calculate position
        const left = this.gridPos.col * (cellSize + gap);
        const top = this.gridPos.row * (cellSize + gap);
        
        // Calculate dimensions maintaining aspect ratio
        const width = this.gridSize.width * cellSize + (this.gridSize.width - 1) * gap;
        const height = this.gridSize.height * cellSize + (this.gridSize.height - 1) * gap;
        
        element.style.position = 'absolute';
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.boxSizing = 'border-box';
    }

    calculateElementCellSize() {
        // Try to get cell size from container's CSS custom property
        const container = this.element?.parentElement;
        if (container) {
            const cellSize = getComputedStyle(container).getPropertyValue('--cell-size');
            if (cellSize) {
                return parseFloat(cellSize);
            }
        }
        
        // Fallback to base size
        return PANEL_GRID_CONFIG.baseElementSize;
    }

    renderContent(element) {
        // Base implementation - override in specific element types
        const content = document.createElement('div');
        content.className = 'element-content';
        content.innerHTML = this.data.content || 'Element';
        element.appendChild(content);
    }

    updateData(newData) {
        this.data = { ...this.data, ...newData };
        if (this.element) {
            this.renderContent(this.element);
        }
    }

    setPosition(col, row) {
        this.gridPos = { col, row };
        this.updateGridPosition();
    }

    setSize(width, height) {
        // Apply constraints
        const constrainedWidth = Math.max(
            this.constraints.minSize.width,
            Math.min(this.constraints.maxSize.width, width)
        );
        const constrainedHeight = Math.max(
            this.constraints.minSize.height,
            Math.min(this.constraints.maxSize.height, height)
        );
        
        this.gridSize = { width: constrainedWidth, height: constrainedHeight };
        this.updateGridPosition();
    }

    serialize() {
        return {
            id: this.id,
            type: this.type,
            gridPos: this.gridPos,
            gridSize: this.gridSize,
            data: this.data,
            constraints: this.constraints
        };
    }
}

// Text Element
class TextElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.TEXT, gridPos, gridSize, {
            content: 'Text content',
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#333',
            align: 'left',
            ...data
        });
    }

    renderContent(element) {
        const content = document.createElement('div');
        content.className = 'element-content';
        
        content.innerHTML = `
            <div class="text-element-content" style="
                font-size: ${this.data.fontSize};
                font-weight: ${this.data.fontWeight};
                color: ${this.data.color};
                text-align: ${this.data.align};
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
                align-items: flex-start;
                word-wrap: break-word;
            ">${this.data.content}</div>
        `;
        
        element.appendChild(content);
    }
}

// Button Element
class ButtonElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.BUTTON, gridPos, gridSize, {
            label: 'Button',
            variant: 'primary',
            action: null,
            ...data
        });
        this.constraints.maxSize = { width: 4, height: 2 };
    }

    renderContent(element) {
        const variantStyles = {
            primary: 'background: #3b82f6; color: white;',
            secondary: 'background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;',
            danger: 'background: #ef4444; color: white;'
        };
        
        const content = document.createElement('div');
        content.className = 'element-content';
        content.style.padding = '0';
        
        content.innerHTML = `
            <button class="button-element-content" style="
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                box-sizing: border-box;
                ${variantStyles[this.data.variant] || variantStyles.primary}
            " onclick="handleElementAction('${this.id}', '${this.data.action || ''}')">${this.data.label}</button>
        `;
        
        element.appendChild(content);
    }
}

// Stat Block Element
class StatBlockElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.STAT_BLOCK, gridPos, gridSize, {
            label: 'Stat',
            value: '0',
            color: '#dc2626',
            ...data
        });
        this.constraints.minSize = { width: 2, height: 2 };
        this.constraints.maxSize = { width: 3, height: 3 };
    }

    renderContent(element) {
        const content = document.createElement('div');
        content.className = 'element-content';
        content.style.padding = '0';
        
        content.innerHTML = `
            <div class="stat-block-element" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #f9fafb;
                border-radius: 4px;
                padding: 8px;
                height: 100%;
                width: 100%;
                text-align: center;
                border: 1px solid #e5e7eb;
                box-sizing: border-box;
            ">
                <div style="
                    font-size: 20px;
                    font-weight: bold;
                    color: ${this.data.color};
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">${this.data.value}</div>
                <div style="
                    font-size: 10px;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-top: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">${this.data.label}</div>
            </div>
        `;
        
        element.appendChild(content);
    }
}

// Status Indicator Element
class StatusIndicatorElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.STATUS_INDICATOR, gridPos, gridSize, {
            label: 'Status',
            status: 'online',
            showLabel: true,
            ...data
        });
        this.constraints.minSize = { width: 1, height: 1 };
        this.constraints.maxSize = { width: 6, height: 1 };
    }

    renderContent(element) {
        const statusColors = {
            online: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            offline: '#6b7280'
        };
        
        element.innerHTML = `
            <div class="status-indicator-element" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px;
                height: 100%;
            ">
                <div style="
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: ${statusColors[this.data.status] || statusColors.offline};
                    flex-shrink: 0;
                "></div>
                ${this.data.showLabel ? `<span style="font-size: 12px; color: #374151;">${this.data.label}</span>` : ''}
            </div>
        `;
    }
}

// Panel Element Factory
class PanelElementFactory {
    static createElement(type, id, gridPos, gridSize, data = {}) {
        switch (type) {
            case PANEL_ELEMENT_TYPES.TEXT:
                return new TextElement(id, gridPos, gridSize, data);
            case PANEL_ELEMENT_TYPES.BUTTON:
                return new ButtonElement(id, gridPos, gridSize, data);
            case PANEL_ELEMENT_TYPES.STAT_BLOCK:
                return new StatBlockElement(id, gridPos, gridSize, data);
            case PANEL_ELEMENT_TYPES.STATUS_INDICATOR:
                return new StatusIndicatorElement(id, gridPos, gridSize, data);
            default:
                return new PanelElement(id, type, gridPos, gridSize, data);
        }
    }

    static deserializeElement(serializedData) {
        const element = this.createElement(
            serializedData.type,
            serializedData.id,
            serializedData.gridPos,
            serializedData.gridSize,
            serializedData.data
        );
        if (serializedData.constraints) {
            element.constraints = { ...element.constraints, ...serializedData.constraints };
        }
        return element;
    }
}

// Global event handlers for element interactions
window.handleElementAction = function(elementId, action) {
    console.log(`Element ${elementId} action: ${action}`);
    document.dispatchEvent(new CustomEvent('elementAction', {
        detail: { elementId, action }
    }));
};

window.handleElementChange = function(elementId, value) {
    console.log(`Element ${elementId} changed to: ${value}`);
    document.dispatchEvent(new CustomEvent('elementChange', {
        detail: { elementId, value }
    }));
}; 
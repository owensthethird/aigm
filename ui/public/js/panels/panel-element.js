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
        
        const startCol = this.gridPos.col + 1;
        const endCol = startCol + this.gridSize.width;
        const startRow = this.gridPos.row + 1;
        const endRow = startRow + this.gridSize.height;
        
        element.style.gridColumn = `${startCol} / ${endCol}`;
        element.style.gridRow = `${startRow} / ${endRow}`;
    }

    renderContent(element) {
        // Base implementation - override in specific element types
        element.innerHTML = `<div class="element-content">${this.data.content || 'Element'}</div>`;
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
        element.innerHTML = `
            <div class="text-element-content" style="
                font-size: ${this.data.fontSize};
                font-weight: ${this.data.fontWeight};
                color: ${this.data.color};
                text-align: ${this.data.align};
                padding: 4px;
                height: 100%;
                overflow: hidden;
            ">${this.data.content}</div>
        `;
    }
}

// Button Element
class ButtonElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.BUTTON, gridPos, gridSize, {
            label: 'Button',
            variant: 'primary', // primary, secondary, danger
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
        
        element.innerHTML = `
            <button class="button-element-content" style="
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                ${variantStyles[this.data.variant] || variantStyles.primary}
            " onclick="handleElementAction('${this.id}', '${this.data.action || ''}')">${this.data.label}</button>
        `;
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
        element.innerHTML = `
            <div class="stat-block-element" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #f9fafb;
                border-radius: 4px;
                padding: 8px;
                height: 100%;
                text-align: center;
            ">
                <div style="
                    font-size: 24px;
                    font-weight: bold;
                    color: ${this.data.color};
                    line-height: 1;
                ">${this.data.value}</div>
                <div style="
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-top: 4px;
                ">${this.data.label}</div>
            </div>
        `;
    }
}

// Input Element
class InputElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.INPUT, gridPos, gridSize, {
            placeholder: 'Enter text...',
            value: '',
            type: 'text', // text, password, number
            ...data
        });
        this.constraints.minSize = { width: 2, height: 1 };
    }

    renderContent(element) {
        element.innerHTML = `
            <input 
                type="${this.data.type}"
                placeholder="${this.data.placeholder}"
                value="${this.data.value}"
                class="input-element-content"
                style="
                    width: 100%;
                    height: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 14px;
                    outline: none;
                "
                onchange="handleElementChange('${this.id}', this.value)"
            />
        `;
    }
}

// Status Indicator Element
class StatusIndicatorElement extends PanelElement {
    constructor(id, gridPos, gridSize, data = {}) {
        super(id, PANEL_ELEMENT_TYPES.STATUS_INDICATOR, gridPos, gridSize, {
            label: 'Status',
            status: 'online', // online, warning, error, offline
            showLabel: true,
            ...data
        });
        this.constraints.minSize = { width: 1, height: 1 };
        this.constraints.maxSize = { width: 4, height: 1 };
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
            case PANEL_ELEMENT_TYPES.INPUT:
                return new InputElement(id, gridPos, gridSize, data);
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
    // Dispatch custom event for panel to handle
    document.dispatchEvent(new CustomEvent('elementAction', {
        detail: { elementId, action }
    }));
};

window.handleElementChange = function(elementId, value) {
    console.log(`Element ${elementId} changed to: ${value}`);
    // Dispatch custom event for panel to handle
    document.dispatchEvent(new CustomEvent('elementChange', {
        detail: { elementId, value }
    }));
}; 
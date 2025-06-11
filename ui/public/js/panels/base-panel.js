// Base Panel Class - Foundation for all panel types
class BasePanel {
    constructor(id, type, origin, size, data = {}) {
        this.id = String(id);
        this.type = type;
        this.origin = { ...origin };
        this.size = { ...size };
        this.data = { ...data };
        this.element = null;
        this.useInternalGrid = false; // Override in subclasses to enable grid
        this.gridManager = null;
    }

    // Create the basic panel structure
    createElement() {
        const panel = document.createElement('div');
        panel.className = `panel ${this.type}-panel`;
        panel.dataset.id = this.id;
        panel.dataset.type = this.type;
        
        // Header
        const header = this.createHeader();
        panel.appendChild(header);
        
        // Content
        const content = this.createContent();
        panel.appendChild(content);
        
        // Resize handle
        const resizeHandle = this.createResizeHandle();
        panel.appendChild(resizeHandle);
        
        this.element = panel;
        return panel;
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'panel-header';
        
        const title = document.createElement('div');
        title.className = 'panel-title';
        
        const icon = document.createElement('span');
        icon.className = 'panel-icon';
        icon.textContent = PANEL_ICONS[this.type] || '📋';
        
        const titleText = document.createElement('span');
        titleText.textContent = this.data.title || 'Panel';
        
        title.appendChild(icon);
        title.appendChild(titleText);
        
        const controls = this.createHeaderControls();
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return header;
    }

    createHeaderControls() {
        const controls = document.createElement('div');
        controls.className = 'panel-controls';
        
        // Edit button (only for grid-enabled panels)
        if (this.useInternalGrid) {
            const editBtn = document.createElement('button');
            editBtn.className = 'panel-control-btn';
            editBtn.innerHTML = '✏';
            editBtn.title = 'Edit Layout';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleEditMode();
            };
            controls.appendChild(editBtn);
        }
        
        // Settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'panel-control-btn';
        settingsBtn.innerHTML = '⚙';
        settingsBtn.title = 'Settings';
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            this.showSettings();
        };
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'panel-control-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.close();
        };
        
        controls.appendChild(settingsBtn);
        controls.appendChild(closeBtn);
        
        return controls;
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        if (this.useInternalGrid) {
            this.gridManager = new PanelGridManager(this);
            this.gridManager.initializeGrid(content);
            this.setupGridContent();
        } else {
            content.innerHTML = 'Base panel content';
        }
        
        return content;
    }

    setupGridContent() {
        // Override in subclasses to add grid elements
    }

    toggleEditMode() {
        if (this.gridManager) {
            const isEditMode = this.gridManager.toggleEditMode();
            
            // Update edit button appearance
            const editBtn = this.element.querySelector('.panel-control-btn[title="Edit Layout"]');
            if (editBtn) {
                editBtn.style.background = isEditMode ? '#3b82f6' : '';
                editBtn.style.color = isEditMode ? 'white' : '';
            }
            
            // Show grid info when in edit mode
            if (isEditMode) {
                const stats = this.gridManager.getGridStats();
                console.log(`Panel ${this.id} edit mode:`, stats);
            }
        }
    }

    // Handle panel resize to update subgrid
    setSize(width, height) {
        this.size = { width, height };
        if (this.gridManager) {
            this.gridManager.updatePanelSize(this.size);
        }
        this.updatePosition();
    }

    createResizeHandle() {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        return handle;
    }

    // Update panel position in the grid
    updatePosition() {
        if (this.element) {
            this.element.style.gridColumn = `${this.origin.col + 1} / span ${this.size.width}`;
            this.element.style.gridRow = `${this.origin.row + 1} / span ${this.size.height}`;
        }
    }

    // Update panel data and refresh content
    updateData(newData) {
        this.data = { ...this.data, ...newData };
        this.refresh();
    }

    // Refresh panel content (to be overridden by subclasses)
    refresh() {
        // Base implementation - override in subclasses
    }

    // Show settings dialog (to be overridden by subclasses)
    showSettings() {
        console.log(`Settings for ${this.type} panel ${this.id}`);
    }

    // Close the panel
    close() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        // Emit close event
        document.dispatchEvent(new CustomEvent('panelClosed', { 
            detail: { panelId: this.id, panelType: this.type }
        }));
    }

    // Serialize panel data for saving
    serialize() {
        return {
            id: this.id,
            type: this.type,
            origin: this.origin,
            size: this.size,
            data: this.data
        };
    }

    // Create panel from serialized data
    static deserialize(serializedData) {
        return new BasePanel(
            serializedData.id,
            serializedData.type,
            serializedData.origin,
            serializedData.size,
            serializedData.data
        );
    }
} 
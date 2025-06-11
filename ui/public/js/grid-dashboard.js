// Main Grid Dashboard - Manages the panel system
class GridDashboard {
    constructor() {
        this.grid = document.getElementById('grid');
        this.background = document.getElementById('background');
        this.panels = [];
        this.panelObjects = new Map(); // Store panel instances
        this.panelCounter = 0;
        this.dragContext = null;
        this.resizeContext = null;
        this.gridConfig = GRID_CONFIG;
        this.minSize = GRID_CONFIG.minSize;
        
        this.init();
    }

    init() {
        this.createBackground();
        this.setupEventListeners();
        this.createSamplePanels();
    }

    createBackground() {
        this.background.innerHTML = '';
        for (let row = 0; row < this.gridConfig.rows; row++) {
            for (let col = 0; col < this.gridConfig.columns; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.innerHTML = `<div class="cell-label">${col + 1},${row + 1}</div>`;
                this.background.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        // Panel type buttons
        Object.values(PANEL_TYPES).forEach(type => {
            const btn = document.getElementById(`add-${type}-panel`);
            if (btn) {
                btn.onclick = () => this.addPanel(type);
            }
        });

        // Layout controls
        const saveBtn = document.getElementById('save');
        const loadBtn = document.getElementById('load');
        const exportBtn = document.getElementById('export-json');
        const importInput = document.getElementById('import-json');
        const importBtn = document.getElementById('import-json-btn');
        const clearBtn = document.getElementById('clear');
        
        if (saveBtn) saveBtn.onclick = () => this.saveLayout();
        if (loadBtn) loadBtn.onclick = () => this.loadLayout();
        if (exportBtn) exportBtn.onclick = () => this.exportToJSON();
        if (importBtn) importBtn.onclick = () => importInput.click();
        if (importInput) importInput.onchange = (e) => this.importFromJSON(e);
        if (clearBtn) clearBtn.onclick = () => this.clearAll();

        // Mouse events
        document.addEventListener('mousemove', e => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Panel events
        document.addEventListener('panelClosed', (e) => this.handlePanelClosed(e));
    }

    addPanel(type) {
        const emptySpace = findEmptySpace(this.panels, this.gridConfig, DEFAULT_PANEL_SIZES[type]);
        if (emptySpace) {
            const panel = PanelFactory.createPanelFromTemplate(type, ++this.panelCounter);
            panel.origin = emptySpace;
            
            this.panels.push(panel.serialize());
            this.panelObjects.set(panel.id, panel);
            this.createPanelDOM(panel);
        } else {
            alert(`No space available for ${PanelFactory.getPanelTypeName(type)}`);
        }
    }

    createPanelDOM(panel) {
        const panelEl = panel.createElement();
        this.updatePanelPosition(panelEl, panel);

        // Setup drag and resize handlers
        const header = panelEl.querySelector('.panel-header');
        const resizeHandle = panelEl.querySelector('.resize-handle');
        
        if (header) {
            header.addEventListener('mousedown', e => this.startDrag(e, panelEl, panel));
        }
        
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', e => this.startResize(e, panelEl, panel));
        }

        this.grid.appendChild(panelEl);
        return panelEl;
    }

    updatePanelPosition(panelEl, panel) {
        panelEl.style.gridColumn = `${panel.origin.col + 1} / span ${panel.size.width}`;
        panelEl.style.gridRow = `${panel.origin.row + 1} / span ${panel.size.height}`;
    }

    startDrag(e, panelEl, panel) {
        e.preventDefault();
        const rect = this.grid.getBoundingClientRect();
        const panelRect = panelEl.getBoundingClientRect();
        
        const currentPanel = this.panels.find(p => p.id === panel.id);
        
        this.dragContext = {
            panelId: panel.id,
            initialOrigin: { ...currentPanel.origin },
            initialArea: { ...currentPanel.size },
            lastValidOrigin: { ...currentPanel.origin },
            allPanels: this.panels,
            gridRect: rect,
            cellDimensions: {
                width: rect.width / this.gridConfig.columns,
                height: rect.height / this.gridConfig.rows
            },
            dragOffset: {
                x: e.clientX - panelRect.left,
                y: e.clientY - panelRect.top
            },
            gridConfig: this.gridConfig
        };
        
        panelEl.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
    }

    startResize(e, panelEl, panel) {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = this.grid.getBoundingClientRect();
        const currentPanel = this.panels.find(p => p.id === panel.id);
        
        this.resizeContext = {
            panelId: panel.id,
            panelOrigin: { ...currentPanel.origin },
            currentResizeOrigin: {
                col: currentPanel.origin.col + currentPanel.size.width,
                row: currentPanel.origin.row + currentPanel.size.height
            },
            initialSize: { ...currentPanel.size },
            lastValidSize: { ...currentPanel.size },
            allPanels: this.panels,
            gridRect: rect,
            cellDimensions: {
                width: rect.width / this.gridConfig.columns,
                height: rect.height / this.gridConfig.rows
            },
            gridConfig: this.gridConfig,
            minSize: this.minSize
        };
        
        panelEl.classList.add('dragging');
        document.body.style.cursor = 'nw-resize';
    }

    handleMouseMove(e) {
        if (this.dragContext) {
            this.handleDragMove(e);
        } else if (this.resizeContext) {
            this.handleResizeMove(e);
        }
    }

    handleDragMove(e) {
        const dragResult = handlePanelDrag(e, this.dragContext);
        const panelEl = document.querySelector(`[data-id="${this.dragContext.panelId}"]`);
        
        panelEl.style.gridColumn = `${dragResult.origin.col + 1} / span ${dragResult.size.width}`;
        panelEl.style.gridRow = `${dragResult.origin.row + 1} / span ${dragResult.size.height}`;
        
        if (dragResult.newValidOrigin) {
            this.dragContext.lastValidOrigin = { ...dragResult.newValidOrigin };
        }
        
        this.dragContext.lastDragResult = dragResult;
        this.showDropPreview(dragResult);
    }

    handleResizeMove(e) {
        const resizeResult = handlePanelResize(e, this.resizeContext);
        const panelEl = document.querySelector(`[data-id="${this.resizeContext.panelId}"]`);
        
        let displaySize = resizeResult.isValid ? resizeResult.size : this.resizeContext.lastValidSize;
        
        if (resizeResult.isValid) {
            this.resizeContext.lastValidSize = { ...resizeResult.size };
        }
        
        panelEl.style.gridColumn = `${resizeResult.panelOrigin.col + 1} / span ${displaySize.width}`;
        panelEl.style.gridRow = `${resizeResult.panelOrigin.row + 1} / span ${displaySize.height}`;
        
        this.resizeContext.lastResizeResult = { ...resizeResult, displaySize };
        this.showResizePreview({ ...resizeResult, size: displaySize, canDrop: true });
    }

    handleMouseUp() {
        if (this.dragContext) {
            this.handleDragRelease();
        } else if (this.resizeContext) {
            this.handleResizeRelease();
        }
    }

    handleDragRelease() {
        const panelEl = document.querySelector(`[data-id="${this.dragContext.panelId}"]`);
        const finalDragResult = this.dragContext.lastDragResult;
        
        if (finalDragResult && finalDragResult.canDrop) {
            this.panels = handlePanelRelease(finalDragResult, this.panels, this.dragContext.panelId);
            // Update panel object
            const panel = this.panelObjects.get(this.dragContext.panelId);
            if (panel) {
                panel.origin = finalDragResult.displayOrigin || finalDragResult.origin;
                panel.size = finalDragResult.displaySize || finalDragResult.size;
            }
        } else {
            // Revert position
            const currentPanel = this.panels.find(p => p.id === this.dragContext.panelId);
            this.updatePanelPosition(panelEl, currentPanel);
        }
        
        panelEl.classList.remove('dragging');
        document.body.style.cursor = '';
        this.dragContext = null;
        this.clearPreviews();
    }

    handleResizeRelease() {
        const panelEl = document.querySelector(`[data-id="${this.resizeContext.panelId}"]`);
        const finalResizeResult = this.resizeContext.lastResizeResult;
        
        if (finalResizeResult && finalResizeResult.canDrop) {
            this.panels = handleResizeRelease(finalResizeResult, this.panels, this.resizeContext.panelId);
            // Update panel object
            const panel = this.panelObjects.get(this.resizeContext.panelId);
            if (panel) {
                panel.size = finalResizeResult.displaySize || finalResizeResult.size;
            }
        }
        
        panelEl.classList.remove('dragging');
        document.body.style.cursor = '';
        this.resizeContext = null;
        this.clearPreviews();
    }

    handlePanelClosed(e) {
        const { panelId } = e.detail;
        this.panels = this.panels.filter(p => p.id !== panelId);
        this.panelObjects.delete(panelId);
    }

    showDropPreview(dragResult) {
        let preview = document.querySelector('.drop-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'drop-preview';
            this.grid.appendChild(preview);
        }

        let className = 'drop-preview';
        if (!dragResult.canDrop) {
            className += ' invalid';
        } else if (dragResult.isPenetrationCollapse || dragResult.isResized) {
            className += ' resized';
        }
        
        preview.className = className;
        preview.style.gridColumn = `${dragResult.origin.col + 1} / span ${dragResult.size.width}`;
        preview.style.gridRow = `${dragResult.origin.row + 1} / span ${dragResult.size.height}`;
    }

    showResizePreview(resizeResult) {
        this.showDropPreview(resizeResult);
    }

    clearPreviews() {
        const preview = document.querySelector('.drop-preview');
        if (preview) preview.remove();
    }

    saveLayout() {
        const layoutData = {
            version: APP_CONFIG.version,
            timestamp: new Date().toISOString(),
            panels: this.panels
        };
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(layoutData));
        console.log('Layout saved');
    }

    loadLayout() {
        const saved = localStorage.getItem(APP_CONFIG.storageKey);
        if (!saved) return;

        try {
            const layoutData = JSON.parse(saved);
            this.clearAll();
            
            layoutData.panels.forEach(panelData => {
                const panel = PanelFactory.deserializePanel(panelData);
                this.panels.push(panel.serialize());
                this.panelObjects.set(panel.id, panel);
                this.createPanelDOM(panel);
                this.panelCounter = Math.max(this.panelCounter, parseInt(panel.id));
            });
            
            console.log('Layout loaded');
        } catch (error) {
            console.error('Error loading layout:', error);
        }
    }

    exportToJSON() {
        const layoutData = {
            version: APP_CONFIG.version,
            timestamp: new Date().toISOString(),
            gridConfig: this.gridConfig,
            panels: this.panels
        };

        const jsonString = JSON.stringify(layoutData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aigm-layout-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const layoutData = JSON.parse(e.target.result);
                this.clearAll();
                
                layoutData.panels.forEach(panelData => {
                    const panel = PanelFactory.deserializePanel(panelData);
                    this.panels.push(panel.serialize());
                    this.panelObjects.set(panel.id, panel);
                    this.createPanelDOM(panel);
                    this.panelCounter = Math.max(this.panelCounter, parseInt(panel.id));
                });
                
                console.log('Layout imported');
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing layout file');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }

    clearAll() {
        this.grid.querySelectorAll('.panel').forEach(p => p.remove());
        this.panels = [];
        this.panelObjects.clear();
        this.panelCounter = 0;
    }

    createSamplePanels() {
        // Create sample panels for demonstration
        const samplePanels = [
            { type: PANEL_TYPES.CHAT, origin: {col: 0, row: 0}, size: {width: 4, height: 4} },
            { type: PANEL_TYPES.CHARACTER, origin: {col: 4, row: 0}, size: {width: 3, height: 5} },
            { type: PANEL_TYPES.DICE, origin: {col: 7, row: 0}, size: {width: 2, height: 3} },
            { type: PANEL_TYPES.STATUS, origin: {col: 9, row: 0}, size: {width: 3, height: 2} },
            { type: PANEL_TYPES.NOTES, origin: {col: 0, row: 4}, size: {width: 4, height: 2} }
        ];

        samplePanels.forEach(({ type, origin, size }) => {
            const panel = PanelFactory.createPanelFromTemplate(type, ++this.panelCounter);
            panel.origin = origin;
            panel.size = size;
            
            this.panels.push(panel.serialize());
            this.panelObjects.set(panel.id, panel);
            this.createPanelDOM(panel);
        });
    }
} 
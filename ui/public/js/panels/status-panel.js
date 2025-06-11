// Status Panel - Shows system and game status information
class StatusPanel extends BasePanel {
    constructor(id, origin, size, data = {}) {
        const defaultData = {
            title: 'System Status',
            ...PANEL_TEMPLATES[PANEL_TYPES.STATUS],
            ...data
        };
        
        super(id, PANEL_TYPES.STATUS, origin, size, defaultData);
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'status-indicators';
        
        content.appendChild(indicatorsContainer);
        this.indicatorsContainer = indicatorsContainer;
        this.refresh();
        
        return content;
    }

    refresh() {
        if (!this.indicatorsContainer) return;
        
        this.indicatorsContainer.innerHTML = '';
        
        (this.data.indicators || []).forEach(indicator => {
            const statusItem = document.createElement('div');
            statusItem.className = 'status-item';
            
            const label = document.createElement('span');
            label.textContent = indicator.label;
            
            const rightSide = document.createElement('div');
            rightSide.style.display = 'flex';
            rightSide.style.alignItems = 'center';
            rightSide.style.gap = '8px';
            
            if (indicator.value) {
                const value = document.createElement('span');
                value.textContent = indicator.value;
                value.style.fontSize = '12px';
                value.style.color = '#6b7280';
                rightSide.appendChild(value);
            }
            
            const statusIndicator = document.createElement('div');
            statusIndicator.className = `status-indicator ${indicator.status}`;
            rightSide.appendChild(statusIndicator);
            
            statusItem.appendChild(label);
            statusItem.appendChild(rightSide);
            this.indicatorsContainer.appendChild(statusItem);
        });
    }

    showSettings() {
        const settings = prompt('Status Indicators (JSON format):', JSON.stringify(this.data.indicators, null, 2));
        
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.updateData({ indicators: parsed });
            } catch (e) {
                alert('Invalid JSON settings');
            }
        }
    }
} 
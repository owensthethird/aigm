// Character Panel - Displays character information and stats
class CharacterPanel extends BasePanel {
    constructor(id, origin, size, data = {}) {
        const defaultData = {
            title: 'Character Sheet',
            ...PANEL_TEMPLATES[PANEL_TYPES.CHARACTER],
            ...data
        };
        
        super(id, PANEL_TYPES.CHARACTER, origin, size, defaultData);
        this.useInternalGrid = true; // Enable internal grid system
    }

    setupGridContent() {
        if (!this.gridManager) return;
        
        const character = this.data.character;
        if (!character) return;

        // Panel is 3x5 = 6x10 subgrid (doubled resolution)
        // Add character name as text element across top
        this.gridManager.addElement(PANEL_ELEMENT_TYPES.TEXT, {col: 0, row: 0}, {width: 6, height: 2}, {
            content: `<strong>${character.name || 'Character'}</strong><br>Level ${character.level || 1}`,
            fontSize: '14px',
            fontWeight: 'bold'
        });

        // Add stat blocks in 3x2 grid formation using subgrid
        if (character.stats) {
            const statNames = Object.keys(character.stats);
            statNames.forEach((stat, index) => {
                const col = (index % 3) * 2; // 3 stats per row, 2 subgrid cells wide each
                const row = Math.floor(index / 3) * 2 + 2; // Start from row 2, 2 subgrid cells tall
                
                this.gridManager.addElement(PANEL_ELEMENT_TYPES.STAT_BLOCK, {col, row}, {width: 2, height: 2}, {
                    label: stat.substring(0, 3).toUpperCase(),
                    value: character.stats[stat],
                    color: '#dc2626'
                });
            });
        }

        // Add HP status indicator (more precise positioning)
        this.gridManager.addElement(PANEL_ELEMENT_TYPES.STATUS_INDICATOR, {col: 0, row: 6}, {width: 6, height: 1}, {
            label: `HP: ${character.hp?.current || 0}/${character.hp?.max || 0}`,
            status: (character.hp?.current > character.hp?.max * 0.5) ? 'online' : 'warning'
        });

        // Add AC and Speed with finer positioning
        this.gridManager.addElement(PANEL_ELEMENT_TYPES.TEXT, {col: 0, row: 7}, {width: 3, height: 1}, {
            content: `AC: ${character.ac || 10}`,
            fontSize: '12px'
        });

        this.gridManager.addElement(PANEL_ELEMENT_TYPES.TEXT, {col: 3, row: 7}, {width: 3, height: 1}, {
            content: `Speed: ${character.speed || 30} ft`,
            fontSize: '12px'
        });

        // Add some additional character info with precise positioning
        this.gridManager.addElement(PANEL_ELEMENT_TYPES.TEXT, {col: 0, row: 8}, {width: 6, height: 2}, {
            content: `Class: Fighter • Race: Human • Background: Soldier`,
            fontSize: '10px',
            color: '#6b7280'
        });
    }

    refresh() {
        if (this.useInternalGrid && this.gridManager) {
            // Clear and recreate grid elements
            this.gridManager.clearElements();
            this.setupGridContent();
        }
    }

    showSettings() {
        const settings = prompt('Character Settings (JSON format):', JSON.stringify(this.data.character, null, 2));
        
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.updateData({ character: parsed });
            } catch (e) {
                alert('Invalid JSON settings');
            }
        }
    }
} 
// Panel Factory - Creates different types of panels
class PanelFactory {
    static createPanel(type, id, origin, size, data = {}) {
        switch (type) {
            case PANEL_TYPES.CHAT:
                return new ChatPanel(id, origin, size, data);
            
            case PANEL_TYPES.CHARACTER:
                return new CharacterPanel(id, origin, size, data);
            
            case PANEL_TYPES.DICE:
                return new DicePanel(id, origin, size, data);
            
            case PANEL_TYPES.STATUS:
                return new StatusPanel(id, origin, size, data);
            
            case PANEL_TYPES.NOTES:
                return new NotesPanel(id, origin, size, data);
            
            default:
                console.warn(`Unknown panel type: ${type}, creating base panel`);
                return new BasePanel(id, type, origin, size, data);
        }
    }

    static createPanelFromTemplate(type, id) {
        const defaultSize = DEFAULT_PANEL_SIZES[type] || { width: 3, height: 2 };
        const templateData = PANEL_TEMPLATES[type] || {};
        
        return this.createPanel(type, id, { col: 0, row: 0 }, defaultSize, templateData);
    }

    static deserializePanel(serializedData) {
        return this.createPanel(
            serializedData.type,
            serializedData.id,
            serializedData.origin,
            serializedData.size,
            serializedData.data
        );
    }

    static getAvailableTypes() {
        return Object.values(PANEL_TYPES);
    }

    static getPanelTypeName(type) {
        const names = {
            [PANEL_TYPES.CHAT]: 'Chat Panel',
            [PANEL_TYPES.CHARACTER]: 'Character Panel',
            [PANEL_TYPES.DICE]: 'Dice Panel',
            [PANEL_TYPES.STATUS]: 'Status Panel',
            [PANEL_TYPES.NOTES]: 'Notes Panel'
        };
        return names[type] || 'Unknown Panel';
    }
} 
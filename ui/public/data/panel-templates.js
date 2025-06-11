// Sample Panel Templates
const PANEL_TEMPLATES = {
    [PANEL_TYPES.CHAT]: {
        title: 'Chat Stream',
        messages: [
            { type: 'ai', content: 'Welcome to the game! What would you like to do?' },
            { type: 'user', content: 'I look around the room.' }
        ]
    },
    
    [PANEL_TYPES.CHARACTER]: {
        title: 'Character Sheet',
        character: {
            name: 'Adventurer',
            level: 1,
            stats: {
                strength: 14,
                dexterity: 12,
                constitution: 16,
                intelligence: 10,
                wisdom: 13,
                charisma: 8
            },
            hp: { current: 23, max: 23 },
            ac: 15,
            speed: 30
        }
    },
    
    [PANEL_TYPES.DICE]: {
        title: 'Dice Roller',
        lastRoll: null,
        history: []
    },
    
    [PANEL_TYPES.STATUS]: {
        title: 'System Status',
        indicators: [
            { label: 'AI Connection', status: 'online' },
            { label: 'Game State', status: 'online' },
            { label: 'Players Connected', status: 'warning', value: '1/4' }
        ]
    },
    
    [PANEL_TYPES.NOTES]: {
        title: 'Game Notes',
        content: 'Your notes go here...\n\n• Remember to check inventory\n• Ask about the mysterious door\n• Talk to innkeeper about quest'
    }
}; 
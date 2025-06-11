// Notes Panel - Simple text editor for game notes
class NotesPanel extends BasePanel {
    constructor(id, origin, size, data = {}) {
        const defaultData = {
            title: 'Game Notes',
            ...PANEL_TEMPLATES[PANEL_TYPES.NOTES],
            ...data
        };
        
        super(id, PANEL_TYPES.NOTES, origin, size, defaultData);
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'panel-content';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        
        // Simple toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'notes-toolbar';
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'notes-tool-btn';
        clearBtn.textContent = 'Clear';
        clearBtn.onclick = () => this.clearNotes();
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'notes-tool-btn';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => this.saveNotes();
        
        toolbar.appendChild(clearBtn);
        toolbar.appendChild(saveBtn);
        
        // Text area
        const textarea = document.createElement('textarea');
        textarea.className = 'notes-textarea';
        textarea.placeholder = 'Type your notes here...';
        textarea.value = this.data.content || '';
        
        // Auto-save on input
        textarea.oninput = () => {
            this.data.content = textarea.value;
        };
        
        content.appendChild(toolbar);
        content.appendChild(textarea);
        
        this.textarea = textarea;
        return content;
    }

    clearNotes() {
        if (confirm('Clear all notes?')) {
            this.textarea.value = '';
            this.data.content = '';
        }
    }

    saveNotes() {
        // In a real implementation, this would save to server/storage
        localStorage.setItem(`notes-panel-${this.id}`, this.data.content);
        
        // Visual feedback
        const originalBg = this.textarea.style.backgroundColor;
        this.textarea.style.backgroundColor = '#d1fae5';
        setTimeout(() => {
            this.textarea.style.backgroundColor = originalBg;
        }, 300);
    }

    refresh() {
        if (this.textarea) {
            this.textarea.value = this.data.content || '';
        }
    }

    showSettings() {
        const options = {
            wordWrap: confirm('Enable word wrap?'),
            spellCheck: confirm('Enable spell check?'),
            fontSize: prompt('Font size (px):', '14') || '14'
        };
        
        if (this.textarea) {
            this.textarea.style.fontSize = options.fontSize + 'px';
            this.textarea.style.wordWrap = options.wordWrap ? 'break-word' : 'normal';
            this.textarea.spellcheck = options.spellCheck;
        }
    }
} 
// Chat Panel - Handles game chat and communication
class ChatPanel extends BasePanel {
    constructor(id, origin, size, data = {}) {
        const defaultData = {
            title: 'Chat Stream',
            messages: [],
            ...PANEL_TEMPLATES[PANEL_TYPES.CHAT],
            ...data
        };
        
        super(id, PANEL_TYPES.CHAT, origin, size, defaultData);
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        // Messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'chat-messages';
        
        // Input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'chat-input';
        input.placeholder = 'Type your message...';
        
        const sendBtn = document.createElement('button');
        sendBtn.className = 'chat-send-btn';
        sendBtn.textContent = 'Send';
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(sendBtn);
        
        content.appendChild(messagesContainer);
        content.appendChild(inputContainer);
        
        // Event listeners
        const sendMessage = () => {
            const message = input.value.trim();
            if (message) {
                this.addMessage('user', message);
                input.value = '';
                
                // Simulate AI response
                setTimeout(() => {
                    this.addMessage('ai', this.generateAIResponse(message));
                }, 1000);
            }
        };
        
        sendBtn.onclick = sendMessage;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };
        
        this.messagesContainer = messagesContainer;
        this.refresh();
        
        return content;
    }

    addMessage(type, content) {
        this.data.messages.push({
            type,
            content,
            timestamp: new Date().toISOString()
        });
        this.refresh();
        this.scrollToBottom();
    }

    generateAIResponse(userMessage) {
        const responses = [
            "Interesting! Tell me more about that.",
            "I see. What would you like to do next?",
            "That's a great idea! Roll for it.",
            "The room is quiet except for the sound of your footsteps.",
            "You notice something glinting in the corner."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    refresh() {
        if (!this.messagesContainer) return;
        
        this.messagesContainer.innerHTML = '';
        
        this.data.messages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${message.type}`;
            messageEl.textContent = message.content;
            this.messagesContainer.appendChild(messageEl);
        });
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    showSettings() {
        const settings = prompt('Chat Settings (JSON format):', JSON.stringify({
            title: this.data.title,
            autoScroll: true,
            timestamps: false
        }, null, 2));
        
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.updateData(parsed);
            } catch (e) {
                alert('Invalid JSON settings');
            }
        }
    }
} 
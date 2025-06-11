// Dice Panel - Handles dice rolling functionality
class DicePanel extends BasePanel {
    constructor(id, origin, size, data = {}) {
        const defaultData = {
            title: 'Dice Roller',
            ...PANEL_TEMPLATES[PANEL_TYPES.DICE],
            ...data
        };
        
        super(id, PANEL_TYPES.DICE, origin, size, defaultData);
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        // Dice controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'dice-controls';
        
        const diceTypes = [
            { label: 'D4', sides: 4 },
            { label: 'D6', sides: 6 },
            { label: 'D8', sides: 8 },
            { label: 'D10', sides: 10 },
            { label: 'D12', sides: 12 },
            { label: 'D20', sides: 20 }
        ];
        
        diceTypes.forEach(dice => {
            const btn = document.createElement('button');
            btn.className = 'dice-btn';
            btn.textContent = dice.label;
            btn.onclick = () => this.rollDice(dice.sides, dice.label);
            controlsContainer.appendChild(btn);
        });
        
        // Result display
        const resultContainer = document.createElement('div');
        resultContainer.className = 'dice-result';
        resultContainer.innerHTML = `
            <div class="dice-result-value">-</div>
            <div style="font-size: 14px; color: #6b7280;">Click a die to roll</div>
        `;
        
        // History
        const historyContainer = document.createElement('div');
        historyContainer.className = 'dice-history';
        
        const historyTitle = document.createElement('div');
        historyTitle.style.fontWeight = 'bold';
        historyTitle.style.marginBottom = '8px';
        historyTitle.textContent = 'Roll History';
        
        content.appendChild(controlsContainer);
        content.appendChild(resultContainer);
        content.appendChild(historyTitle);
        content.appendChild(historyContainer);
        
        this.resultContainer = resultContainer;
        this.historyContainer = historyContainer;
        this.refresh();
        
        return content;
    }

    rollDice(sides, label) {
        const result = Math.floor(Math.random() * sides) + 1;
        const rollData = {
            dice: label,
            result: result,
            timestamp: new Date().toISOString()
        };
        
        this.data.lastRoll = rollData;
        this.data.history = this.data.history || [];
        this.data.history.unshift(rollData);
        
        // Keep only last 10 rolls
        if (this.data.history.length > 10) {
            this.data.history = this.data.history.slice(0, 10);
        }
        
        this.refresh();
        this.animateRoll(result);
    }

    animateRoll(finalResult) {
        if (!this.resultContainer) return;
        
        const resultValue = this.resultContainer.querySelector('.dice-result-value');
        let animationCount = 0;
        const maxAnimations = 10;
        
        const animate = () => {
            if (animationCount < maxAnimations) {
                resultValue.textContent = Math.floor(Math.random() * 20) + 1;
                animationCount++;
                setTimeout(animate, 100);
            } else {
                resultValue.textContent = finalResult;
                resultValue.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    resultValue.style.transform = 'scale(1)';
                }, 200);
            }
        };
        
        animate();
    }

    refresh() {
        if (!this.resultContainer || !this.historyContainer) return;
        
        // Update result display
        if (this.data.lastRoll) {
            const resultValue = this.resultContainer.querySelector('.dice-result-value');
            const resultLabel = this.resultContainer.children[1];
            
            if (resultValue) {
                resultValue.textContent = this.data.lastRoll.result;
            }
            if (resultLabel) {
                resultLabel.textContent = `Last roll: ${this.data.lastRoll.dice}`;
            }
        }
        
        // Update history
        this.historyContainer.innerHTML = '';
        (this.data.history || []).forEach(roll => {
            const historyItem = document.createElement('div');
            historyItem.className = 'dice-history-item';
            historyItem.textContent = `${roll.dice}: ${roll.result} (${new Date(roll.timestamp).toLocaleTimeString()})`;
            this.historyContainer.appendChild(historyItem);
        });
    }

    showSettings() {
        alert('Dice panel settings - Custom dice configurations coming soon!');
    }
} 
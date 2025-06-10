import React, { useState } from 'react';
import { useGameState, GameStatus } from '../contexts/GameStateContext';
import StatusIndicator, { StatusType } from './StatusIndicator';
import { formatTimestamp } from '../utils/helpers';

type FormEvent = React.FormEvent<HTMLFormElement>;
type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

/**
 * Game state panel component for displaying and controlling the game state
 */
function GameStatePanel(): React.ReactElement {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    resumeGame, 
    endGame,
    addGameEvent
  } = useGameState();
  
  const [newSessionName, setNewSessionName] = useState('');
  const [newGameSystem, setNewGameSystem] = useState('');
  const [showNewGameForm, setShowNewGameForm] = useState(false);
  
  // Handle new game form submission
  const handleStartNewGame = (e: FormEvent) => {
    e.preventDefault();
    if (!newSessionName || !newGameSystem) return;
    
    startGame(newSessionName, newGameSystem);
    setNewSessionName('');
    setNewGameSystem('');
    setShowNewGameForm(false);
  };
  
  // Handle adding a custom event
  const handleAddCustomEvent = (type: string, description: string) => {
    addGameEvent({
      type,
      description
    });
  };
  
  // Handle adding a custom event with user input
  const [customEventText, setCustomEventText] = useState('');
  
  const handleAddCustomEventWithInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customEventText.trim()) return;
    
    addGameEvent({
      type: 'custom',
      description: customEventText
    });
    
    setCustomEventText('');
  };
  
  // Function to render status controls based on current game status
  const renderStatusControls = () => {
    const status = gameState.status;
    
    switch (status) {
      case 'idle':
        return (
          <button 
            className="primary-button"
            onClick={() => setShowNewGameForm(true)}
          >
            Start New Game
          </button>
        );
        
      case 'active':
        return (
          <div className="game-controls">
            <button 
              className="secondary-button"
              onClick={pauseGame}
            >
              Pause Game
            </button>
            <button 
              className="danger-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to end this game session?')) {
                  endGame();
                }
              }}
            >
              End Game
            </button>
          </div>
        );
        
      case 'paused':
        return (
          <div className="game-controls">
            <button 
              className="primary-button"
              onClick={resumeGame}
            >
              Resume Game
            </button>
            <button 
              className="danger-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to end this game session?')) {
                  endGame();
                }
              }}
            >
              End Game
            </button>
          </div>
        );
        
      case 'processing':
        return (
          <div className="processing-indicator">
            <StatusIndicator type="processing" label="Processing" pulse />
            <p>Please wait while the AI processes the game state...</p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="game-state-panel">
      <div className="panel-header">
        <h2>Game State</h2>
      </div>
      
      {/* Game Status Section */}
      <div className="game-status-section">
        <div className="status-header">
          <StatusIndicator type={gameState.status as 'active' | 'processing' | 'success' | 'warning' | 'error' | 'idle' | 'paused'} />
          <h3>
            {gameState.status === 'idle' 
              ? 'No Active Game' 
              : gameState.sessionName}
          </h3>
        </div>
        
        {gameState.status !== 'idle' && (
          <div className="game-info">
            <p><strong>System:</strong> {gameState.gameSystem}</p>
            <p><strong>Location:</strong> {gameState.currentLocation || 'Unknown'}</p>
            <p>
              <strong>Active Character:</strong> {
                gameState.activeCharacterId 
                  ? gameState.characters.find(c => c.id === gameState.activeCharacterId)?.name || 'Unknown'
                  : 'None'
              }
            </p>
            <p><strong>Last Update:</strong> {formatTimestamp(gameState.lastUpdateTime)}</p>
          </div>
        )}
        
        {showNewGameForm ? (
          <form onSubmit={handleStartNewGame} className="new-game-form">
            <div className="form-group">
              <label htmlFor="session-name">Session Name</label>
              <input
                id="session-name"
                type="text"
                value={newSessionName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSessionName(e.target.value)}
                placeholder="Enter session name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="game-system">Game System</label>
              <input
                id="game-system"
                type="text"
                value={newGameSystem}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGameSystem(e.target.value)}
                placeholder="Enter game system"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-button">
                Start Game
              </button>
              <button 
                type="button" 
                className="secondary-button"
                onClick={() => setShowNewGameForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="status-controls">
            {renderStatusControls()}
          </div>
        )}
      </div>
      
      {/* Game Events Section */}
      <div className="game-events-section">
        <h3>Recent Events</h3>
        
        {gameState.events.length === 0 ? (
          <p className="empty-state">No events recorded yet.</p>
        ) : (
          <ul className="event-list">
            {gameState.events.slice(-10).reverse().map(event => (
              <li key={event.id} className="event-item">
                <div className="event-time">
                  {formatTimestamp(event.timestamp)}
                </div>
                <div className="event-description">
                  <span className="event-type">[{event.type}]</span> {event.description}
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {gameState.status === 'active' && (
          <div className="add-event-form">
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleAddCustomEventWithInput(e)} className="custom-event-form">
              <input
                type="text"
                value={customEventText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEventText(e.target.value)}
                placeholder="Add custom event..."
                className="input-field small"
              />
              <button 
                type="submit" 
                className="primary-button small"
                disabled={!customEventText.trim()}
              >
                Add
              </button>
            </form>
            <div className="quick-event-buttons">
              <button 
                onClick={() => handleAddCustomEvent('scene_change', 'Scene changed')}
                className="secondary-button small"
              >
                Scene Change
              </button>
              <button 
                onClick={() => handleAddCustomEvent('combat_start', 'Combat initiated')}
                className="secondary-button small danger"
              >
                Combat Start
              </button>
              <button 
                onClick={() => handleAddCustomEvent('rest', 'Party resting')}
                className="secondary-button small success"
              >
                Rest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStatePanel;

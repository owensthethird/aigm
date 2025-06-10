import React, { useState } from 'react';
import { useGameState, Character } from '../contexts/GameStateContext';
import { generateId } from '../utils/helpers';
import Button from './Button';
import Input from './Input';

interface CharacterFormData {
  name: string;
  type: 'player' | 'npc' | 'enemy';
  description: string;
}

/**
 * Character management panel component for displaying and editing characters
 */
const CharacterPanel: React.FC = () => {
  const { gameState, addCharacter, removeCharacter, setActiveCharacter } = useGameState();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    type: 'player',
    description: '',
  });
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCharacter: Character = {
      id: generateId(),
      name: formData.name,
      type: formData.type as Character['type'],
      description: formData.description,
    };
    
    addCharacter(newCharacter);
    setFormData({
      name: '',
      type: 'player',
      description: '',
    });
    setShowForm(false);
  };

  // Select a character for viewing details
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setActiveCharacter(character.id);
  };

  // Delete a character
  const handleDeleteCharacter = (characterId: string) => {
    removeCharacter(characterId);
    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null);
    }
  };

  return (
    <div className="character-panel">
      <div className="panel-header">
        <h2>Characters</h2>
        <Button 
          variant="primary"
          size="small"
          onClick={() => {
            setShowForm(true);
            setSelectedCharacter(null);
          }}
          text="Add Character"
        />
      </div>

      {showForm && (
        <div className="character-form">
          <h3>New Character</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="player">Player Character</option>
                <option value="npc">Non-Player Character</option>
                <option value="enemy">Enemy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary"
                text="Save Character"
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowForm(false)}
                text="Cancel"
              />
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          {gameState.characters.length === 0 ? (
            <div className="empty-state">
              <p>No characters created yet.</p>
              <button 
                className="primary-button" 
                onClick={() => setShowForm(true)}
              >
                Create Character
              </button>
            </div>
          ) : (
            <div className="character-list">
              {gameState.characters.map(character => (
                <div 
                  key={character.id} 
                  className={`character-item ${character.id === gameState.activeCharacterId ? 'active' : ''}`}
                  onClick={() => handleSelectCharacter(character)}
                >
                  <div className="character-name">{character.name}</div>
                  <div className="character-type">{character.type}</div>
                  <button 
                    className="delete-button" 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character.id);
                    }}
                    aria-label={`Delete ${character.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedCharacter && (
            <div className="character-details">
              <h3>{selectedCharacter.name}</h3>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedCharacter.type}</span>
              </div>
              {selectedCharacter.description && (
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <p className="detail-value">{selectedCharacter.description}</p>
                </div>
              )}
              {selectedCharacter.stats && Object.entries(selectedCharacter.stats).length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Stats:</span>
                  <div className="stats-grid">
                    {Object.entries(selectedCharacter.stats).map(([key, value]) => (
                      <div key={key} className="stat-item">
                        <span className="stat-name">{key}:</span>
                        <span className="stat-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CharacterPanel;

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

// Game state types based on interface design
export type GameStatus = 'idle' | 'active' | 'processing' | 'paused';
export type CharacterType = 'player' | 'npc' | 'enemy';

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  stats?: Record<string, any>;
  inventory?: any[];
  description?: string;
  imageUrl?: string;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  affectedEntities?: string[];
  metadata?: Record<string, any>;
}

interface GameState {
  gameId: string | null;
  sessionName: string;
  status: GameStatus;
  characters: Character[];
  activeCharacterId: string | null;
  events: GameEvent[];
  currentLocation: string;
  gameRules: string;
  gameSystem: string;
  lastUpdateTime: number;
}

const initialGameState: GameState = {
  gameId: null,
  sessionName: 'Untitled Session',
  status: 'idle',
  characters: [],
  activeCharacterId: null,
  events: [],
  currentLocation: '',
  gameRules: '',
  gameSystem: '',
  lastUpdateTime: Date.now()
};

interface GameStateContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  startGame: (sessionName: string, gameSystem: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  addCharacter: (character: Character) => void;
  removeCharacter: (characterId: string) => void;
  setActiveCharacter: (characterId: string) => void;
  addGameEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load from localStorage
    const savedState = localStorage.getItem('aigm-game-state');
    return savedState ? JSON.parse(savedState) : initialGameState;
  });

  // Save to localStorage whenever game state changes
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prevState => {
      const newState = { ...prevState, ...updates, lastUpdateTime: Date.now() };
      localStorage.setItem('aigm-game-state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Game management functions
  const startGame = useCallback((sessionName: string, gameSystem: string) => {
    updateGameState({
      gameId: `game_${Date.now()}`,
      sessionName,
      gameSystem,
      status: 'active',
      events: [
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'game_start',
          description: `Game session "${sessionName}" started`
        }
      ]
    });
  }, [updateGameState]);

  const pauseGame = useCallback(() => {
    updateGameState({ 
      status: 'paused',
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'game_paused',
          description: 'Game session paused'
        }
      ]
    });
  }, [gameState.events, updateGameState]);

  const resumeGame = useCallback(() => {
    updateGameState({ 
      status: 'active',
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'game_resumed',
          description: 'Game session resumed'
        }
      ]
    });
  }, [gameState.events, updateGameState]);

  const endGame = useCallback(() => {
    updateGameState({ 
      status: 'idle',
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'game_ended',
          description: 'Game session ended'
        }
      ]
    });
  }, [gameState.events, updateGameState]);

  // Character management functions
  const addCharacter = useCallback((character: Character) => {
    updateGameState({ 
      characters: [...gameState.characters, character],
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'character_added',
          description: `Character "${character.name}" added to the game`,
          affectedEntities: [character.id]
        }
      ]
    });
  }, [gameState.characters, gameState.events, updateGameState]);

  const removeCharacter = useCallback((characterId: string) => {
    const character = gameState.characters.find(c => c.id === characterId);
    if (!character) return;
    
    updateGameState({ 
      characters: gameState.characters.filter(c => c.id !== characterId),
      activeCharacterId: gameState.activeCharacterId === characterId ? null : gameState.activeCharacterId,
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'character_removed',
          description: `Character "${character.name}" removed from the game`,
          affectedEntities: [characterId]
        }
      ]
    });
  }, [gameState.characters, gameState.activeCharacterId, gameState.events, updateGameState]);

  const setActiveCharacter = useCallback((characterId: string) => {
    const character = gameState.characters.find(c => c.id === characterId);
    if (!character) return;
    
    updateGameState({ 
      activeCharacterId: characterId,
      events: [
        ...gameState.events,
        {
          id: `event_${Date.now()}`,
          timestamp: Date.now(),
          type: 'active_character_changed',
          description: `Active character changed to "${character.name}"`,
          affectedEntities: [characterId]
        }
      ]
    });
  }, [gameState.characters, gameState.events, updateGameState]);

  // Event management
  const addGameEvent = useCallback((event: Omit<GameEvent, 'id' | 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      id: `event_${Date.now()}`,
      timestamp: Date.now()
    };
    
    updateGameState({
      events: [...gameState.events, newEvent]
    });
  }, [gameState.events, updateGameState]);

  return (
    <GameStateContext.Provider value={{
      gameState,
      updateGameState,
      startGame,
      pauseGame,
      resumeGame,
      endGame,
      addCharacter,
      removeCharacter,
      setActiveCharacter,
      addGameEvent
    }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

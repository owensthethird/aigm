import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { useGameState } from '../contexts/GameStateContext';

const HomePage: React.FC = () => {
  const { gameState, startGame } = useGameState();

  // Welcome screen shown when no active game is running
  const WelcomeScreen = () => (
    <div className="welcome-screen">
      <h2>Welcome to AI Game Master</h2>
      <p>Your interactive storytelling companion for tabletop role-playing games.</p>
      
      <div className="action-buttons">
        <button 
          className="primary-button"
          onClick={() => startGame('New Adventure', 'Fantasy RPG')}
        >
          Start New Game
        </button>
      </div>
      
      <div className="features-overview">
        <h3>Features</h3>
        <ul>
          <li>Interactive storytelling powered by AI</li>
          <li>Real-time game state management</li>
          <li>Character creation and tracking</li>
          <li>Multiple visualization themes</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {gameState.status === 'idle' ? (
        <WelcomeScreen />
      ) : (
        <ChatInterface />
      )}
    </div>
  );
};

export default HomePage;

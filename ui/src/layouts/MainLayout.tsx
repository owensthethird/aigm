import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../contexts/ApiContext';
import { useGameState } from '../contexts/GameStateContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameStatePanel from '../components/GameStatePanel';
import CharacterPanel from '../components/CharacterPanel';

const MainLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isConnected } = useApi();
  const { gameState } = useGameState();
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const toggleLeftPanel = () => {
    setLeftPanelOpen(!leftPanelOpen);
    if (!leftPanelOpen) setRightPanelOpen(false);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
    if (!rightPanelOpen) setLeftPanelOpen(false);
  };

  return (
    <div className={`app theme-${theme}`}>
      <Header 
        toggleLeftPanel={toggleLeftPanel}
        toggleRightPanel={toggleRightPanel}
      />

      <div className="main-content">
        {/* Game State Panel (Left) */}
        <div className={`left-panel ${leftPanelOpen ? 'open' : ''}`}>
          <div className="panel-header">
            <h2>Game State</h2>
            <button 
              className="close-panel" 
              onClick={() => setLeftPanelOpen(false)}
            >
              &times;
            </button>
          </div>
          <GameStatePanel />
        </div>

        {/* Main Chat Panel (Center) */}
        <div className="center-panel">
          <Outlet />
        </div>

        {/* Character/Game Info Panel (Right) */}
        <div className={`right-panel ${rightPanelOpen ? 'open' : ''}`}>
          <div className="panel-header">
            <h2>Characters & Info</h2>
            <button 
              className="close-panel" 
              onClick={() => setRightPanelOpen(false)}
            >
              &times;
            </button>
          </div>
          <CharacterPanel />
        </div>

        {/* Mobile overlay for panels */}
        <div 
          className={`panel-overlay ${leftPanelOpen || rightPanelOpen ? 'active' : ''}`}
          onClick={() => {
            setLeftPanelOpen(false);
            setRightPanelOpen(false);
          }}
        ></div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameStateProvider } from './contexts/GameStateContext';
import { ApiProvider } from './contexts/ApiContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './styles/App.css';
import './styles/status-indicators.css';

function App() {
  return (
    <ThemeProvider>
      <ApiProvider>
        <GameStateProvider>
          <WebSocketProvider serverUrl="http://localhost:3000">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                {/* Add more routes here as the application grows */}
              </Route>
            </Routes>
          </WebSocketProvider>
        </GameStateProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;

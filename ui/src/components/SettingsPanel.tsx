import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useTheme, ThemeName } from '../contexts/ThemeContext';

/**
 * Settings panel component for configuring the aiGM interface
 */
const SettingsPanel: React.FC = () => {
  const { apiKey, setApiKey, baseUrl, setBaseUrl, isConnected } = useApi();
  const { theme, setTheme } = useTheme();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [newBaseUrl, setNewBaseUrl] = useState(baseUrl);
  
  const handleSaveSettings = () => {
    setApiKey(newApiKey);
    setBaseUrl(newBaseUrl);
  };
  
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as ThemeName);
  };
  
  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>API Configuration</h3>
        <div className="form-group">
          <label htmlFor="base-url">n8n Base URL</label>
          <input
            id="base-url"
            type="text"
            value={newBaseUrl}
            onChange={(e) => setNewBaseUrl(e.target.value)}
            placeholder="http://localhost:5678"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="api-key">API Key</label>
          <div className="api-key-input">
            <input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter your n8n API Key"
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? 'Hide API Key' : 'Show API Key'}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button className="primary-button" onClick={handleSaveSettings}>
            Save API Settings
          </button>
        </div>
        
        <div className="connection-status">
          <span>API Connection: </span>
          {isConnected ? (
            <span className="status-connected">Connected</span>
          ) : (
            <span className="status-disconnected">Disconnected</span>
          )}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Interface Theme</h3>
        <div className="form-group">
          <label htmlFor="theme-select">Select Theme</label>
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="classic-fantasy">Classic Fantasy</option>
            <option value="modern-minimalist">Modern Minimalist</option>
            <option value="sci-fi-cyberpunk">Sci-Fi/Cyberpunk</option>
          </select>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>About</h3>
        <p>AI Game Master Interface</p>
        <p>Version 0.1.0</p>
      </div>
    </div>
  );
};

export default SettingsPanel;

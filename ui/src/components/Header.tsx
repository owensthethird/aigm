import React from 'react';
import { useTheme, ThemeName } from '../contexts/ThemeContext';
import ConnectionStatus from './ConnectionStatus';

interface HeaderProps {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleLeftPanel, toggleRightPanel }) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    // Cycle through available themes
    const themes: ThemeName[] = ['classic-fantasy', 'modern-minimalist', 'sci-fi-cyberpunk'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  return (
    <header className="header">
      <div className="logo">
        <h1>AI Game Master</h1>
      </div>
      
      <ConnectionStatus />
      
      <nav className="main-nav">
        <button 
          onClick={toggleLeftPanel} 
          className="mobile-only"
        >
          Game State
        </button>
        <button 
          onClick={toggleRightPanel} 
          className="mobile-only"
        >
          Character Info
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
        >
          🎨 Theme
        </button>
      </nav>
    </header>
  );
};

export default Header;

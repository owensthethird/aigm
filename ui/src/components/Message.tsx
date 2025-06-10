import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageType } from '../types/chat';

interface MessageProps {
  type: MessageType;
  content: string;
  timestamp: number;
  sender: string;
  isLoading?: boolean;
}

/**
 * Message component for displaying chat messages with appropriate styling based on type
 * Supports Markdown rendering for enhanced content display
 */
const Message: React.FC<MessageProps> = ({ 
  type, 
  content, 
  timestamp, 
  sender, 
  isLoading = false 
}) => {
  // For animating the typing indicator
  const [dots, setDots] = useState('.');
  
  // Animate the typing indicator when loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots.length >= 3) return '.';
        return prevDots + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // Get message style accent color based on type
  const getAccentColor = () => {
    const typePrefix = type.split('-')[0]; // 'admin', 'ooc', or 'ic'
    const typeSuffix = type.split('-')[1]; // 'user', 'player', or 'ai'
    return `var(--${type}-primary)`;
  };

  // Get message icon based on context
  const getMessageIcon = () => {
    const typeSuffix = type.split('-')[1]; // 'user', 'player', or 'ai'
    if (typeSuffix === 'ai') {
      return '🤖';
    } else if (type === 'admin-user') {
      return '🔧';
    } else {
      return '👤';
    }
  };

  return (
    <div className={`message ${type}-message fade-in`}>
      <div className="message-header" style={{ borderBottom: `1px solid ${getAccentColor()}` }}>
        <span className="sender">
          <span className="message-icon" aria-hidden="true">{getMessageIcon()}</span>
          {sender}
        </span>
        <span className="timestamp">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="message-content">
        {isLoading ? (
          <div className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default Message;

import React, { useState, useRef, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import Message from './Message';
import Button from './Button';
import Input from './Input';
import ProviderStatus from './ProviderStatus';
import ChatService from '../services/ChatService';
import { ChatMessage, MessageType, DEFAULT_CHAT_CONTEXTS } from '../types/chat';

// Using types from '../types/chat'

const ChatInterface: React.FC = () => {
  const { gameState, addGameEvent } = useGameState();
  const { status: wsStatus, sendMessage, messages: wsMessages, providerStatus } = useWebSocket();
  
  // Combine welcome message with websocket messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'admin-ai',
      content: `Welcome to "${gameState.sessionName}"! I'll be your AI Game Master today. What would you like to do?`,
      timestamp: Date.now(),
      sender: 'AI GM'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('ooc-player');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = ChatService.getInstance();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Listen for websocket messages
  useEffect(() => {
    // Only add messages of type "message"
    const newMessages = wsMessages
      .filter(msg => msg.type === 'message')
      .map(msg => ({
        ...msg.payload,
        id: msg.payload.id || `msg_${msg.timestamp}`,
        timestamp: msg.timestamp
      }));
    
    if (newMessages.length > 0) {
      // Add new messages and stop loading state
      setMessages(prev => [...prev, ...newMessages]);
      setIsLoading(false);
      
      // Log in-character messages to game events
      newMessages.forEach(msg => {
        if (msg.type === 'ic-ai') {
          addGameEvent({
            type: 'game_master_narration',
            description: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '')
          });
        }
      });
    }
  }, [wsMessages, addGameEvent]);
  
  // Group messages by date for better visual organization
  const groupedMessages = messages.reduce<Record<string, ChatMessage[]>>((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Get the right response type based on current message type
    let responseType: MessageType = 'ooc-ai';
    if (messageType === 'ic-player') {
      responseType = 'ic-ai';
    } else if (messageType === 'ooc-player') {
      responseType = 'ooc-ai';
    } else if (messageType === 'admin-user') {
      responseType = 'admin-ai';
    }
    
    // Create player message
    const newPlayerMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: messageType,
      content: inputValue,
      timestamp: Date.now(),
      sender: 'You'
    };
    
    // Add player message to state
    setMessages(prev => [...prev, newPlayerMessage]);
    
    // Clear input
    setInputValue('');
    
    // Log as game event if it's in-character
    if (messageType === 'ic-player') {
      addGameEvent({
        type: 'player_action',
        description: inputValue
      });
    }
    
    try {
      // Set loading state to show typing indicator
      setIsLoading(true);
      
      // Add a temporary loading message to show typing indicator
      const loadingMessage: ChatMessage = {
        id: `loading_${Date.now()}`,
        type: responseType,
        content: '',
        timestamp: Date.now(),
        sender: 'AI GM',
        isLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // Send message to API
      await chatService.sendMessage(inputValue, messageType);
      
      // Note: No need to manually add response, WebSocket will deliver it
      // The useEffect hook handling wsMessages will add the real message
      // and the loading message will be replaced
    } catch (error) {
      // Handle error - show error message
      console.error('Failed to send message:', error);
      
      // Remove loading message
      setIsLoading(false);
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading)
      );
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'admin-ai',
        content: 'Failed to send message. Please check your connection and try again.',
        timestamp: Date.now(),
        sender: 'System'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  


  return (
    <div className="chat-container">
      {/* Connection Status */}
      <div className="connection-status">
        <ProviderStatus 
          providers={providerStatus.map(update => ({
            id: update.providerId,
            name: update.providerId,
            status: update.status,
            isActive: true,
            type: 'unknown'
          }))}
        />
      </div>
      
      <div className="chat-messages">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="message-group">
            <div className="date-separator">
              <span>{date}</span>
            </div>
            {dateMessages.map((message) => (
              <div key={message.id} className="message-wrapper">
                <Message
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                  sender={message.sender}
                />
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="message-type-selector">
          <Button 
            variant={messageType === 'ic-player' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setMessageType('ic-player')}
            title="In-Character: What your character says or does"
            className={`type-button ${messageType === 'ic-player' ? 'active' : ''}`}
            text="IC"
          />
          <Button 
            variant={messageType === 'ooc-player' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setMessageType('ooc-player')}
            title="Out-of-Character: Meta-game discussions"
            className={`type-button ${messageType === 'ooc-player' ? 'active' : ''}`}
            text="OOC"
          />
          <Button 
            variant={messageType === 'admin-user' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setMessageType('admin-user')}
            title="Admin: System commands and settings"
            className={`type-button ${messageType === 'admin-user' ? 'active' : ''}`}
            text="Admin"
          />
        </div>
        
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <Button 
            type="submit" 
            variant="primary"
            className="send-button"
            text="Send"
          />
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

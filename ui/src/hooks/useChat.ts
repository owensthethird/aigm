import { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useN8nApi } from './useN8nApi';
import { generateId } from '../utils/helpers';

export interface ChatMessage {
  id: string;
  type: 'admin-user' | 'admin-ai' | 'ooc-player' | 'ooc-ai' | 'ic-player' | 'ic-ai';
  content: string;
  timestamp: number;
  sender: string;
}

interface UseChatOptions {
  workflowId?: string;
  initialMessages?: ChatMessage[];
  persistKey?: string;
}

/**
 * Custom hook for managing chat messages and interactions with the AI Game Master
 */
export const useChat = (options: UseChatOptions = {}) => {
  const { workflowId, initialMessages = [], persistKey = 'aigm-chat-messages' } = options;
  const { gameState, addGameEvent } = useGameState();
  const { executeWorkflow, isLoading } = useN8nApi();
  
  // Initialize messages from localStorage if persistKey is provided
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (persistKey) {
      const saved = localStorage.getItem(persistKey);
      return saved ? JSON.parse(saved) : initialMessages;
    }
    return initialMessages;
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(persistKey, JSON.stringify(messages));
    }
  }, [messages, persistKey]);
  
  // Add a new message to the chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  }, []);
  
  // Clear all messages from the chat
  const clearMessages = useCallback(() => {
    setMessages([]);
    if (persistKey) {
      localStorage.removeItem(persistKey);
    }
  }, [persistKey]);
  
  // Send a message to the AI Game Master
  const sendMessage = useCallback(async (
    content: string,
    type: ChatMessage['type'] = 'ic-player',
    sender: string = 'You'
  ) => {
    if (!content.trim()) return null;
    
    // Add user message to chat
    const userMessage = addMessage({
      type,
      content,
      sender
    });
    
    // Log as game event if it's in-character
    if (type === 'ic-player') {
      addGameEvent({
        type: 'player_action',
        description: content
      });
    }
    
    // If we have a workflow ID, send the message to n8n for processing
    if (workflowId) {
      setIsAiResponding(true);
      
      try {
        const data = {
          message: content,
          messageType: type,
          gameState: gameState
        };
        
        const result = await executeWorkflow(workflowId, data);
        
        if (result) {
          // Get the response from the execution result
          let aiResponse = 'I didn\'t understand that. Please try again.';
          let responseType: ChatMessage['type'] = 'ooc-ai';
          
          if (result.data?.resultData?.runData) {
            // Extract response from workflow execution data
            // This structure will depend on your n8n workflow output format
            const outputData = Object.values(result.data.resultData.runData).pop();
            if (outputData && Array.isArray(outputData) && outputData.length > 0) {
              const lastNode = outputData[outputData.length - 1];
              if (lastNode?.data?.main?.[0]) {
                aiResponse = lastNode.data.main[0].response || aiResponse;
                responseType = lastNode.data.main[0].type || responseType;
              }
            }
          }
          
          // Match response type to input type if not specified
          if (type === 'ic-player' && responseType === 'ooc-ai') {
            responseType = 'ic-ai';
          } else if (type === 'admin-user' && responseType === 'ooc-ai') {
            responseType = 'admin-ai';
          }
          
          // Add AI response to chat
          const aiMessage = addMessage({
            type: responseType,
            content: aiResponse,
            sender: 'AI GM'
          });
          
          // Log as game event if it's in-character narration
          if (responseType === 'ic-ai') {
            addGameEvent({
              type: 'game_master_narration',
              description: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : '')
            });
          }
          
          setIsAiResponding(false);
          return aiMessage;
        }
      } catch (error) {
        console.error('Error sending message to AI:', error);
        
        // Add error message
        addMessage({
          type: 'admin-ai',
          content: 'Sorry, there was an error processing your message. Please try again later.',
          sender: 'System'
        });
        
        setIsAiResponding(false);
        return null;
      }
    } else {
      // Simulate AI response if no workflow ID is provided
      setIsAiResponding(true);
      
      // Simulate network delay
      setTimeout(() => {
        let responseType: ChatMessage['type'] = 'ooc-ai';
        let response = 'I understand your message, but I need more context.';
        
        // Match response context to input context
        if (type === 'ic-player') {
          responseType = 'ic-ai';
          response = "The world responds to your actions. As the game master, I'm here to narrate the outcomes and provide a rich, immersive experience for you.";
        } else if (type === 'ooc-player') {
          responseType = 'ooc-ai';
          response = "That's a good question about the game mechanics. As your Game Master, I'll help clarify how things work in this world.";
        } else if (type === 'admin-user') {
          responseType = 'admin-ai';
          response = "I've processed your system request. Is there anything else you need to configure?";
        }
        
        // Add simulated AI response
        const aiMessage = addMessage({
          type: responseType,
          content: response,
          sender: 'AI GM'
        });
        
        // Add game event for in-character responses
        if (responseType === 'ic-ai') {
          addGameEvent({
            type: 'game_master_narration',
            description: response.substring(0, 100) + (response.length > 100 ? '...' : '')
          });
        }
        
        setIsAiResponding(false);
      }, 1000);
    }
    
    return userMessage;
  }, [addMessage, addGameEvent, workflowId, executeWorkflow, gameState]);
  
  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    addMessage,
    clearMessages,
    isLoading: isLoading || isAiResponding,
  };
};

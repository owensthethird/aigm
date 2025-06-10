/**
 * Chat message types for the aiGM application
 */

// Message types based on the context system
export type MessageType = 
  | 'admin-user' | 'admin-ai'  // Administrative context
  | 'ooc-player' | 'ooc-ai'    // Out-of-character context
  | 'ic-player' | 'ic-ai';     // In-character context

// Basic chat message structure
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  sender: string;
  isLoading?: boolean;
  metadata?: Record<string, any>; // For any additional data
}

// Message with typing indicator state
export interface TypingIndicatorState {
  isTyping: boolean;
  contextType: 'admin' | 'ooc' | 'ic';
}

// Chat context types
export interface ChatContext {
  id: 'admin' | 'ooc' | 'ic';
  name: string;
  playerType: MessageType; // Message type for player in this context
  aiType: MessageType;     // Message type for AI in this context
  description: string;
}

// Default chat contexts
export const DEFAULT_CHAT_CONTEXTS: ChatContext[] = [
  {
    id: 'admin',
    name: 'Administrative',
    playerType: 'admin-user',
    aiType: 'admin-ai',
    description: 'System-level communication'
  },
  {
    id: 'ooc',
    name: 'Out-of-Character',
    playerType: 'ooc-player',
    aiType: 'ooc-ai',
    description: 'Meta game discussions'
  },
  {
    id: 'ic',
    name: 'In-Character',
    playerType: 'ic-player',
    aiType: 'ic-ai',
    description: 'Role-playing conversation'
  }
];

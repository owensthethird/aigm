// src/services/chat-service.ts
import { v4 as uuidv4 } from 'uuid';
import { ProviderManager } from '../ai-providers/provider-manager';
import { ChatDataAccess, ChatMessageData } from '../data/ai-data';
import { WebSocketServer } from '../websocket';
import { ChatMessage as AIChatMessage } from '../ai-providers/base-provider';

// Types for the chat service
export interface ChatMessage {
  content: string;
  context_type: 'ic' | 'ooc' | 'admin';
  session_id: string;
  sender_type: 'player' | 'ai';
  preferredProvider?: string;
  role?: 'system' | 'user' | 'assistant';
}

export interface ChatResponse {
  id: number;
  content: string;
  context: 'ic' | 'ooc' | 'admin';
  sender: 'ai';
  provider: string;
  timestamp: string;
}

export interface HistoryOptions {
  limit: number;
  offset: number;
  contextType?: 'ic' | 'ooc' | 'admin';
}

export interface ChatHistory {
  messages: Array<{
    id: number;
    content: string;
    context: 'ic' | 'ooc' | 'admin';
    sender: 'player' | 'ai';
    provider?: string;
    timestamp: string;
  }>;
  total: number;
}

export interface ProviderHealthStatus {
  providers: Array<{
    id: number;
    name: string;
    type: string;
    status: 'healthy' | 'unhealthy';
    latency: number;
  }>;
  activeProvider: {
    id: number;
    name: string;
  };
}

/**
 * Service for handling chat interactions with AI
 */
export class ChatService {
  private providerManager: ProviderManager;
  private chatDataAccess: ChatDataAccess;
  private websocketServer?: WebSocketServer;
  
  constructor(
    providerManager: ProviderManager,
    chatDataAccess: ChatDataAccess,
    websocketServer?: WebSocketServer
  ) {
    this.providerManager = providerManager;
    this.chatDataAccess = chatDataAccess;
    this.websocketServer = websocketServer;
  }

  /**
   * Send a message to the AI and get a response
   */
  async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    try {
      // Save user message to database
      const userMessageId = await this.chatDataAccess.saveChatMessage({
        session_id: message.session_id,
        context_type: message.context_type,
        sender_type: 'player',
        content: message.content
      });

      // Get the appropriate system prompt based on context
      const systemPrompt = this.getSystemPrompt(message.context_type);
      
      // Get chat history for context
      const history = await this.chatDataAccess.getChatMessages(
        message.session_id,
        10, // Get last 10 messages for context
        0,
        message.context_type
      );
      
      // Format messages for AI provider
      const aiMessages: AIChatMessage[] = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Add history messages
      history.reverse().forEach(msg => {
        aiMessages.push({
          role: msg.sender_type === 'player' ? 'user' : 'assistant',
          content: msg.content
        });
      });
      
      // Add the current message
      aiMessages.push({
        role: 'user',
        content: message.content
      });
      
      // Get response from AI provider
      const provider = this.providerManager.getActiveProvider();
      let aiResponse;
      try {
        aiResponse = await this.providerManager.chat(aiMessages);
      } catch (error) {
        console.warn('Failed to get response from AI provider:', error instanceof Error ? error.message : String(error));
        // Provide a fallback response when all providers are unhealthy
        aiResponse = {
          content: "I'm sorry, but I'm currently experiencing technical difficulties. Please try again later or contact support if the issue persists.",
          role: 'assistant',
          id: uuidv4()
        };
      }
      
      // Save AI response to database
      const aiMessageId = await this.chatDataAccess.saveChatMessage({
        session_id: message.session_id,
        context_type: message.context_type,
        sender_type: 'ai',
        content: aiResponse.content,
        provider_used: provider.getConfig().type
      });
      
      // Get the saved message with ID
      const savedMessage = await this.chatDataAccess.getChatMessages(
        message.session_id,
        1,
        0
      );
      
      const responseMessage = savedMessage[0];
      
      // Broadcast message via WebSocket if available
      if (this.websocketServer) {
        this.websocketServer.broadcastToSession(message.session_id, {
          type: 'ai_message',
          message: {
            id: responseMessage.id,
            content: responseMessage.content,
            context: responseMessage.context_type,
            sender: responseMessage.sender_type,
            provider: responseMessage.provider_used,
            timestamp: responseMessage.created_at
          }
        });
      }
      
      // Return formatted response
      return {
        id: responseMessage.id!,
        content: responseMessage.content,
        context: responseMessage.context_type,
        sender: 'ai',
        provider: responseMessage.provider_used || provider.getConfig().type,
        timestamp: responseMessage.created_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in sendMessage:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: string, options: HistoryOptions): Promise<ChatHistory> {
    try {
      // Get messages from database
      const messages = await this.chatDataAccess.getChatMessages(
        sessionId,
        options.limit,
        options.offset,
        options.contextType
      );
      
      // Count total messages for pagination
      const countQuery = await this.chatDataAccess.getChatMessages(
        sessionId,
        1000000, // Large number to get all messages
        0,
        options.contextType
      );
      
      // Format messages for response
      const formattedMessages = messages.map(msg => ({
        id: msg.id!,
        content: msg.content,
        context: msg.context_type,
        sender: msg.sender_type,
        provider: msg.provider_used,
        timestamp: msg.created_at?.toISOString() || new Date().toISOString()
      }));
      
      return {
        messages: formattedMessages,
        total: countQuery.length
      };
    } catch (error) {
      console.error('Error in getHistory:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Check health of all AI providers
   */
  async checkProvidersHealth(): Promise<ProviderHealthStatus> {
    try {
      // Trigger health check
      await this.providerManager.checkProvidersHealth();
      
      // Get all providers health status
      const providersHealth = this.providerManager.getAllProvidersHealth();
      const activeProvider = this.providerManager.getActiveProvider();
      
      // Format response
      return {
        providers: providersHealth.map(ph => {
          // Find provider in list to get ID and name
          const provider = this.providerManager.getAllProviders().find(
            p => p.getConfig().type === ph.provider
          );
          
          return {
            id: Number(provider?.getConfig().id || 0),
            name: String(provider?.getConfig().name || ph.provider),
            type: ph.provider,
            status: ph.health.status === 'healthy' ? 'healthy' : 'unhealthy',
            latency: ph.health.latency
          } as const;
        }),
        activeProvider: {
          id: Number(activeProvider.getConfig().id || 0),
          name: String(activeProvider.getConfig().name || activeProvider.getConfig().type)
        }
      };
    } catch (error) {
      console.error('Error in checkProvidersHealth:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get system prompt based on context type
   * This implements the color system from the UI implementation plan:
   * - Administrative Context (Level 1) - Red for user, Green for AI
   * - Out-of-Character Context (Level 2) - Blue for player, Orange for AI
   * - In-Character Context (Level 3) - Green for player, Purple for AI
   */
  private getSystemPrompt(contextType: 'ic' | 'ooc' | 'admin'): string {
    switch (contextType) {
      case 'admin':
        return `You are an AI assistant helping with administrative tasks for a tabletop RPG game.
                You're in ADMINISTRATIVE CONTEXT (Level 1).
                In this context, the user messages appear in RED and your responses appear in GREEN.
                Focus on system management, user management, and technical assistance.`;
      
      case 'ooc':
        return `You are an AI game master assistant helping with out-of-character discussions for a tabletop RPG game.
                You're in OUT-OF-CHARACTER CONTEXT (Level 2).
                In this context, the player messages appear in BLUE and your responses appear in ORANGE.
                Focus on rule discussions, character creation advice, and meta-game conversations.`;
      
      case 'ic':
        return `You are an AI game master narrating an immersive tabletop RPG experience.
                You're in IN-CHARACTER CONTEXT (Level 3).
                In this context, the player messages appear in GREEN and your responses appear in PURPLE.
                Stay in character, narrate the world vividly, and respond to player actions as if you are the game world.`;
      
      default:
        return `You are an AI assistant for a tabletop RPG game.`;
    }
  }
}

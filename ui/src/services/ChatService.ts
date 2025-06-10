import axios from 'axios';
import { ChatMessage, MessageType } from '../types/chat';

/**
 * Service for handling chat-related API requests
 */
class ChatService {
  private static instance: ChatService;
  private baseUrl: string = 'http://localhost:3000/api';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Set the base URL for API requests
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get chat message history
   * @param limit Maximum number of messages to retrieve
   * @param before Timestamp to get messages before
   * @param contextType Optional context type filter (ic, ooc, admin)
   */
  public async getMessages(
    limit: number = 50,
    before?: number,
    contextType?: 'ic' | 'ooc' | 'admin'
  ): Promise<ChatMessage[]> {
    try {
      const params = { limit, before, contextType };
      const response = await axios.get(`${this.baseUrl}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new chat message
   * @param content Message content
   * @param type Message type
   */
  public async sendMessage(
    content: string,
    type: MessageType
  ): Promise<ChatMessage> {
    try {
      const message = {
        content,
        type,
        timestamp: Date.now(),
        sender: 'Player'
      };
      
      const response = await axios.post(`${this.baseUrl}/messages`, message);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get available message context types
   * Returns the available context types (ic, ooc, admin)
   */
  public async getMessageContexts(): Promise<{ id: string; name: string; }[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/contexts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message contexts:', error);
      // Return default contexts if API fails
      return [
        { id: 'admin', name: 'Admin' },
        { id: 'ooc', name: 'Out-of-Character' },
        { id: 'ic', name: 'In-Character' }
      ];
    }
  }

  /**
   * Clear chat history
   * Deletes all messages in the current chat session
   */
  public async clearChat(): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/messages`);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

export default ChatService;

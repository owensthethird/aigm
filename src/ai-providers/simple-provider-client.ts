/**
 * SimpleProviderClient
 * 
 * A lightweight client for connecting to a single LLM provider.
 * Focuses on core functionality of connecting to providers and sending/receiving messages.
 */

import { AIProviderConfig } from './provider-config';
import { ChatMessage, ChatCompletionResponse } from './provider-types';

/**
 * Base class for simple provider clients
 * Handles basic provider connection and message exchange
 */
export abstract class SimpleProviderClient {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /**
   * Test the connection to the provider
   * @returns Promise resolving to boolean indicating connection success
   */
  async testConnection(): Promise<boolean> {
    try {
      // Basic connection test logic to be implemented by subclasses
      return await this.runConnectionTest();
    } catch (error) {
      console.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Send a chat completion request
   * @param messages Array of chat messages
   * @returns Promise resolving to chat completion response
   */
  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      // Provider-specific implementation to be provided by subclasses
      return await this.sendChatRequest(messages);
    } catch (error) {
      throw new Error(`Chat completion failed: ${error.message}`);
    }
  }

  /**
   * Send a streaming chat completion request
   * @param messages Array of chat messages
   * @returns AsyncGenerator yielding partial chat completion responses
   */
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<Partial<ChatCompletionResponse>> {
    try {
      // Provider-specific streaming implementation to be provided by subclasses
      yield* this.sendChatStreamRequest(messages);
    } catch (error) {
      throw new Error(`Chat stream failed: ${error.message}`);
    }
  }

  /**
   * Shutdown the provider client
   */
  async shutdown(): Promise<void> {
    // Base implementation does nothing, subclasses can override if needed
    return;
  }

  // Abstract methods to be implemented by provider-specific subclasses
  protected abstract runConnectionTest(): Promise<boolean>;
  protected abstract sendChatRequest(messages: ChatMessage[]): Promise<ChatCompletionResponse>;
  protected abstract sendChatStreamRequest(messages: ChatMessage[]): AsyncGenerator<Partial<ChatCompletionResponse>>;
}

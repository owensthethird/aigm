/**
 * OllamaProviderClient
 * 
 * A simplified client for connecting to Ollama LLM provider.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AIProviderConfig } from '../../ai-providers/provider-config';
import { ChatMessage, ChatCompletionResponse } from '../../ai-providers/provider-types';
import { SimpleProviderClient } from '../../ai-providers/simple-provider-client';

/**
 * Ollama-specific configuration
 */
export interface OllamaConfig extends AIProviderConfig {
  type: 'ollama';
  keepAlive?: boolean;
  numCtx?: number; // Context window size
}

/**
 * Implementation of the Ollama provider client
 */
export class OllamaProviderClient extends SimpleProviderClient {
  private client: AxiosInstance;
  private requestConfig: AxiosRequestConfig;

  constructor(config: OllamaConfig) {
    super({
      ...config,
      type: 'ollama'
    });

    // Create axios client for Ollama API
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.requestConfig = {
      timeout: config.timeout || 30000
    };
  }

  /**
   * Test connection to Ollama
   */
  protected async runConnectionTest(): Promise<boolean> {
    try {
      // Ollama doesn't have a dedicated health endpoint, so we'll use the list models endpoint
      const response = await this.client.get('/api/tags', this.requestConfig);
      
      if (response.status === 200) {
        // Check if our configured model is available
        const models = response.data.models || [];
        const modelAvailable = models.some((model: any) => model.name === this.config.model);
        
        if (!modelAvailable) {
          console.warn(`Ollama model '${this.config.model}' is not loaded`);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Convert standard chat messages to Ollama format
   */
  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      // Ollama uses 'system' for system messages, 'user' for user, and 'assistant' for assistant
      return {
        role: msg.role,
        content: msg.content
      };
    });
  }

  /**
   * Send a chat request to Ollama
   */
  protected async sendChatRequest(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const formattedMessages = this.formatMessages(messages);
    
    const requestBody = {
      model: this.config.model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: 0.7,
      }
    };

    const response = await this.client.post('/api/chat', requestBody, this.requestConfig);
    
    // Parse the response
    const result = response.data;
    
    return {
      id: result.id || `ollama-${Date.now()}`,
      content: result.message.content,
      finish_reason: 'stop',
      usage: {
        prompt_tokens: result.prompt_eval_count || 0,
        completion_tokens: result.eval_count || 0,
        total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0)
      }
    };
  }

  /**
   * Send a streaming chat request to Ollama
   */
  protected async *sendChatStreamRequest(messages: ChatMessage[]): AsyncGenerator<Partial<ChatCompletionResponse>> {
    const formattedMessages = this.formatMessages(messages);
    
    const requestBody = {
      model: this.config.model,
      messages: formattedMessages,
      stream: true,
      options: {
        temperature: 0.7,
      }
    };

    try {
      const response = await this.client.post('/api/chat', requestBody, {
        ...this.requestConfig,
        responseType: 'stream'
      });

      const stream = response.data;
      
      let buffer = '';
      let responseId = `ollama-${Date.now()}`;
      let promptTokens = 0;
      let completionTokens = 0;
      
      for await (const chunk of stream) {
        try {
          const lines = chunk.toString().split('\n').filter(Boolean);
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.done) {
                // Final chunk with usage info
                promptTokens = data.prompt_eval_count || 0;
                completionTokens = data.eval_count || 0;
                
                yield {
                  id: responseId,
                  content: buffer,
                  finish_reason: 'stop',
                  usage: {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens
                  }
                };
                
                return;
              } else {
                // Content chunk
                const content = data.message?.content || '';
                buffer += content;
                
                yield {
                  id: responseId,
                  content,
                  finish_reason: null
                };
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError);
            }
          }
        } catch (chunkError) {
          console.error('Error processing stream chunk:', chunkError);
        }
      }
    } catch (error) {
      throw new Error(`Ollama streaming request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * LMStudioProviderClient
 * 
 * A simplified client for connecting to LM Studio local API.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AIProviderConfig } from '../../ai-providers/provider-config';
import { ChatMessage, ChatCompletionResponse } from '../../ai-providers/provider-types';
import { SimpleProviderClient } from '../../ai-providers/simple-provider-client';

/**
 * LMStudio-specific configuration
 */
export interface LMStudioConfig extends AIProviderConfig {
  type: 'lmstudio';
}

/**
 * Implementation of the LM Studio provider client
 */
export class LMStudioProviderClient extends SimpleProviderClient {
  private client: AxiosInstance;
  private requestConfig: AxiosRequestConfig;

  constructor(config: LMStudioConfig) {
    super({
      ...config,
      type: 'lmstudio'
    });

    // Create axios client for LM Studio API
    this.client = axios.create({
      baseURL: config.endpoint || 'http://localhost:1234/v1',
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
   * Test connection to LM Studio
   */
  protected async runConnectionTest(): Promise<boolean> {
    try {
      // LM Studio uses OpenAI-compatible API, so we'll use the models endpoint
      const response = await this.client.get('/models', this.requestConfig);
      
      if (response.status === 200) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to connect to LM Studio: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Convert standard chat messages to LM Studio format (OpenAI compatible)
   */
  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      return {
        role: msg.role,
        content: msg.content
      };
    });
  }

  /**
   * Send a chat request to LM Studio
   */
  protected async sendChatRequest(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const formattedMessages = this.formatMessages(messages);
    
    const requestBody = {
      model: this.config.model,
      messages: formattedMessages,
      temperature: 0.7,
      stream: false
    };

    const response = await this.client.post('/chat/completions', requestBody, this.requestConfig);
    
    // Parse the response
    const result = response.data;
    const choice = result.choices[0];
    
    return {
      id: result.id || `lmstudio-${Date.now()}`,
      content: choice.message.content,
      finish_reason: choice.finish_reason || 'stop',
      usage: result.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  }

  /**
   * Send a streaming chat request to LM Studio
   */
  protected async *sendChatStreamRequest(messages: ChatMessage[]): AsyncGenerator<Partial<ChatCompletionResponse>> {
    const formattedMessages = this.formatMessages(messages);
    
    const requestBody = {
      model: this.config.model,
      messages: formattedMessages,
      temperature: 0.7,
      stream: true
    };

    try {
      const response = await this.client.post('/chat/completions', requestBody, {
        ...this.requestConfig,
        responseType: 'stream'
      });

      const stream = response.data;
      
      let buffer = '';
      let responseId = `lmstudio-${Date.now()}`;
      let finishReason = null;
      
      for await (const chunk of stream) {
        try {
          const lines = chunk.toString()
            .split('\n')
            .filter(Boolean)
            .map(line => line.replace(/^data: /, '').trim())
            .filter(line => line !== '' && line !== '[DONE]');
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                
                if (choice.finish_reason) {
                  finishReason = choice.finish_reason;
                }
                
                if (choice.delta && choice.delta.content) {
                  const content = choice.delta.content;
                  buffer += content;
                  
                  yield {
                    id: responseId,
                    content,
                    finish_reason: null
                  };
                }
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError);
            }
          }
        } catch (chunkError) {
          console.error('Error processing stream chunk:', chunkError);
        }
      }
      
      // Final yield with complete content
      if (buffer) {
        yield {
          id: responseId,
          content: buffer,
          finish_reason: finishReason || 'stop'
        };
      }
    } catch (error) {
      throw new Error(`LM Studio streaming request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

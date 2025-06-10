/**
 * OpenAIProviderClient
 * 
 * A simplified client for connecting to OpenAI API.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AIProviderConfig } from '../../ai-providers/provider-config';
import { ChatMessage, ChatCompletionResponse } from '../../ai-providers/provider-types';
import { SimpleProviderClient } from '../../ai-providers/simple-provider-client';

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig extends AIProviderConfig {
  type: 'openai';
  apiKey: string;
}

/**
 * Implementation of the OpenAI provider client
 */
export class OpenAIProviderClient extends SimpleProviderClient {
  private client: AxiosInstance;
  private requestConfig: AxiosRequestConfig;

  constructor(config: OpenAIConfig) {
    super({
      ...config,
      type: 'openai'
    });

    // Create axios client for OpenAI API
    this.client = axios.create({
      baseURL: config.endpoint || 'https://api.openai.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    this.requestConfig = {
      timeout: config.timeout || 30000
    };
  }

  /**
   * Test connection to OpenAI
   */
  protected async runConnectionTest(): Promise<boolean> {
    try {
      // Use models endpoint to test connection
      const response = await this.client.get('/models', this.requestConfig);
      
      if (response.status === 200) {
        // Check if our configured model is available
        const models = response.data.data || [];
        const modelAvailable = models.some((model: any) => model.id === this.config.model);
        
        if (!modelAvailable) {
          console.warn(`OpenAI model '${this.config.model}' may not be available`);
          // We don't fail here because the models endpoint might not list all available models
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to connect to OpenAI: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Convert standard chat messages to OpenAI format
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
   * Send a chat request to OpenAI
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
      id: result.id,
      content: choice.message.content,
      finish_reason: choice.finish_reason,
      usage: result.usage
    };
  }

  /**
   * Send a streaming chat request to OpenAI
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
      let responseId = '';
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
              
              if (!responseId && data.id) {
                responseId = data.id;
              }
              
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
      throw new Error(`OpenAI streaming request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

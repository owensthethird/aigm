// src/ai-providers/ollama-provider.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  BaseAIProvider, 
  AIProviderConfig, 
  ChatMessage, 
  ChatCompletionOptions, 
  ChatCompletionResponse,
  ProviderHealth,
  FunctionCall
} from './base-provider';

/**
 * Ollama-specific configuration
 */
export interface OllamaConfig extends AIProviderConfig {
  type: 'ollama';
  keepAlive?: boolean;
  numCtx?: number; // Context window size
}

/**
 * Implementation of the Ollama AI provider
 */
export class OllamaProvider extends BaseAIProvider {
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
   * Initialize the Ollama provider
   */
  async initialize(): Promise<void> {
    try {
      // Check if Ollama is available
      const health = await this.checkHealth();
      
      if (health.status === 'healthy') {
        console.log(`Ollama provider initialized successfully at ${this.config.endpoint}`);
        console.log(`Using model: ${this.config.model}`);
      } else {
        console.warn(`Ollama provider initialized but health check failed: ${health.message}`);
      }
    } catch (error) {
      console.error('Failed to initialize Ollama provider:', error instanceof Error ? error.message : String(error));
      throw new Error(`Ollama provider initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check the health of the Ollama provider
   */
  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Ollama doesn't have a dedicated health endpoint, so we'll use the list models endpoint
      const response = await this.client.get('/api/tags', this.requestConfig);
      
      const latency = Date.now() - startTime;
      
      if (response.status === 200) {
        // Check if our configured model is available
        const models = response.data.models || [];
        const modelAvailable = models.some((model: any) => model.name === this.config.model);
        
        if (modelAvailable) {
          this.health = {
            status: 'healthy',
            latency,
            message: 'Ollama is available and model is loaded',
            timestamp: new Date()
          };
        } else {
          this.health = {
            status: 'degraded',
            latency,
            message: `Ollama is available but model '${this.config.model}' is not loaded`,
            timestamp: new Date()
          };
        }
      } else {
        this.health = {
          status: 'unhealthy',
          latency,
          message: `Unexpected response from Ollama: ${response.status}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      this.health = {
        status: 'unhealthy',
        latency,
        message: `Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      };
    }
    
    return this.health;
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
   * Generate a chat completion using Ollama
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    try {
      const formattedMessages = this.formatMessages(messages);
      
      const requestBody = {
        model: this.config.model,
        messages: formattedMessages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens,
          // Add Ollama-specific options here
        }
      };

      // Handle function calling if provided
      if (options?.functions && options.functions.length > 0) {
        // Ollama doesn't natively support function calling, so we'll implement it via prompt engineering
        // Add function definitions to the system prompt
        const functionDefinitions = JSON.stringify(options.functions);
        const systemMessage = messages.find(m => m.role === 'system');
        
        if (systemMessage) {
          systemMessage.content += `\n\nYou have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`;
        } else {
          // Add a new system message if one doesn't exist
          messages.unshift({
            role: 'system',
            content: `You have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`
          });
        }
      }

      const response = await this.client.post('/api/chat', requestBody, this.requestConfig);
      
      // Parse the response
      const result = response.data;
      
      // Check if the response contains a function call (our custom implementation)
      let functionCall: FunctionCall | undefined = undefined;
      try {
        // Try to parse the response as JSON to check for function calls
        const parsedResponse = JSON.parse(result.message.content);
        if (parsedResponse.function_call) {
          functionCall = {
            name: parsedResponse.function_call.name,
            arguments: JSON.stringify(parsedResponse.function_call.arguments)
          };
        }
      } catch (e) {
        // Not JSON or doesn't contain function_call, which is fine
      }

      return {
        id: result.id || `ollama-${Date.now()}`,
        content: functionCall ? '' : result.message.content,
        function_call: functionCall,
        finish_reason: functionCall ? 'function_call' : 'stop',
        usage: {
          prompt_tokens: result.prompt_eval_count || 0,
          completion_tokens: result.eval_count || 0,
          total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('Ollama chat completion error:', error instanceof Error ? error.message : String(error));
      throw new Error(`Ollama chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a streaming chat completion using Ollama
   */
  async *chatStream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<Partial<ChatCompletionResponse>> {
    try {
      const formattedMessages = this.formatMessages(messages);
      
      const requestBody = {
        model: this.config.model,
        messages: formattedMessages,
        stream: true,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens,
          // Add Ollama-specific options here
        }
      };

      // Handle function calling if provided (same as in chat method)
      if (options?.functions && options.functions.length > 0) {
        const functionDefinitions = JSON.stringify(options.functions);
        const systemMessage = messages.find(m => m.role === 'system');
        
        if (systemMessage) {
          systemMessage.content += `\n\nYou have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`;
        } else {
          messages.unshift({
            role: 'system',
            content: `You have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`
          });
        }
      }

      const response = await this.client.post('/api/chat', requestBody, {
        ...this.requestConfig,
        responseType: 'stream'
      });

      // Process the stream
      const stream = response.data;
      let buffer = '';
      let responseId = `ollama-${Date.now()}`;

      for await (const chunk of stream) {
        const text = chunk.toString();
        buffer += text;
        
        // Try to parse JSON objects from the buffer
        try {
          const result = JSON.parse(buffer);
          buffer = '';
          
          // Check if this is a done message
          if (result.done) {
            // Final message with usage stats
            yield {
              id: responseId,
              finish_reason: 'stop',
              usage: {
                prompt_tokens: result.prompt_eval_count || 0,
                completion_tokens: result.eval_count || 0,
                total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0)
              }
            };
          } else {
            // Content chunk
            if (result.message && result.message.content) {
              yield {
                id: responseId,
                content: result.message.content
              };
            }
          }
        } catch (e) {
          // Not a complete JSON object yet, continue collecting chunks
        }
      }
    } catch (error) {
      console.error('Ollama streaming chat completion error:', error instanceof Error ? error.message : String(error));
      throw new Error(`Ollama streaming chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Shutdown the Ollama provider
   */
  async shutdown(): Promise<void> {
    // Nothing specific to clean up for Ollama
    console.log('Ollama provider shut down');
  }
}

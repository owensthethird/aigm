// src/ai-providers/base-provider.ts
import { EventEmitter } from 'events';

/**
 * Configuration interface for AI providers
 */
export interface AIProviderConfig {
  id?: number; // Database ID for the provider
  name?: string; // Display name for the provider
  type: 'ollama' | 'lmstudio' | 'openapi' | 'openai';
  endpoint: string;
  model: string;
  enabled: boolean;
  priority: number; // For failover ordering
  healthCheck: boolean;
  apiKey?: string; // Optional for providers that require API keys
  timeout?: number; // Request timeout in milliseconds
  maxRetries?: number; // Maximum number of retries on failure
}

/**
 * Message role types for chat conversations
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string; // Used for function messages
}

/**
 * Function definition for AI function calling
 */
export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema object
}

/**
 * Function call response from AI
 */
export interface FunctionCall {
  name: string;
  arguments: string; // JSON string of arguments
}

/**
 * Chat completion options
 */
export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  functions?: AIFunction[];
  function_call?: 'auto' | 'none' | { name: string };
  stream?: boolean;
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  id: string;
  content: string;
  function_call?: FunctionCall;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Provider health status
 */
export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number; // in milliseconds
  message?: string;
  timestamp: Date;
}

/**
 * Abstract base class for all AI providers
 */
export abstract class BaseAIProvider extends EventEmitter {
  protected config: AIProviderConfig;
  protected health: ProviderHealth;
  
  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
    this.health = {
      status: 'unhealthy',
      latency: 0,
      message: 'Not initialized',
      timestamp: new Date()
    };
  }

  /**
   * Get the provider configuration
   */
  getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  /**
   * Get the current health status of the provider
   */
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  /**
   * Check if the provider is healthy
   */
  isHealthy(): boolean {
    return this.health.status === 'healthy';
  }

  /**
   * Check if the provider is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Initialize the provider
   */
  abstract initialize(): Promise<void>;

  /**
   * Perform a health check on the provider
   */
  abstract checkHealth(): Promise<ProviderHealth>;

  /**
   * Generate a chat completion
   * @param messages Array of chat messages
   * @param options Completion options
   */
  abstract chat(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate a streaming chat completion
   * @param messages Array of chat messages
   * @param options Completion options
   */
  abstract chatStream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<Partial<ChatCompletionResponse>>;

  /**
   * Shutdown the provider and clean up resources
   */
  abstract shutdown(): Promise<void>;
}

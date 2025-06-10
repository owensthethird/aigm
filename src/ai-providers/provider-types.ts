/**
 * Common types for AI providers
 */

/**
 * Chat message format
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

/**
 * Chat completion response format
 */
export interface ChatCompletionResponse {
  id: string;
  content: string;
  finish_reason: string | null;
  function_call?: {
    name: string;
    arguments: string;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Chat completion options
 */
export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, any>;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
}

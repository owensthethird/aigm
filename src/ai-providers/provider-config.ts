/**
 * Provider configuration types
 */

/**
 * Base configuration for all AI providers
 */
export interface AIProviderConfig {
  type: string;
  name?: string;
  model: string;
  endpoint?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Provider Registry
 * 
 * A simple factory for provider clients
 */

import { AIProviderConfig } from './provider-config';
import { SimpleProviderClient } from './simple-provider-client';

import { OllamaProviderClient } from './providers/ollama-provider';
import { OpenAIProviderClient } from './providers/openai-provider';
import { LMStudioProviderClient } from './providers/lmstudio-provider';

/**
 * Registry for provider types and factory for provider clients
 */
export class ProviderRegistry {
  /**
   * List of supported provider types
   */
  private static providerTypes = [
    'ollama',
    'openai',
    'lmstudio'
  ];

  /**
   * Get a client for the specified provider type
   * @param config Provider configuration
   * @returns SimpleProviderClient instance for the specified provider type
   */
  static getClient(config: AIProviderConfig): SimpleProviderClient {
    // Validate provider type
    if (!this.providerTypes.includes(config.type)) {
      throw new Error(`Unsupported provider type: ${config.type}`);
    }
    
    // Return appropriate provider client
    switch (config.type) {
      case 'ollama':
        return new OllamaProviderClient(config);
      case 'openai':
        return new OpenAIProviderClient(config);
      case 'lmstudio':
        return new LMStudioProviderClient(config);
      default:
        throw new Error(`Provider type ${config.type} not implemented`);
    }
  }

  /**
   * Get available provider types
   * @returns Array of available provider types
   */
  static getAvailableProviderTypes(): string[] {
    return [...this.providerTypes];
  }
}

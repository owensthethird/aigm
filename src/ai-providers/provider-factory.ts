// src/ai-providers/provider-factory.ts
import { BaseAIProvider, AIProviderConfig } from './base-provider';
import { OllamaProvider, OllamaConfig } from './ollama-provider';

/**
 * Factory class for creating AI providers based on configuration
 */
export class AIProviderFactory {
  /**
   * Create an AI provider instance based on the provided configuration
   * @param config Provider configuration
   * @returns An instance of the appropriate AI provider
   */
  static createProvider(config: AIProviderConfig): BaseAIProvider {
    switch (config.type) {
      case 'ollama':
        return new OllamaProvider(config as OllamaConfig);
      
      // Add other provider types as they are implemented
      // case 'lmstudio':
      //   return new LMStudioProvider(config as LMStudioConfig);
      // case 'openapi':
      //   return new OpenAPIProvider(config as OpenAPIConfig);
      // case 'openai':
      //   return new OpenAIProvider(config as OpenAIConfig);
      
      default:
        throw new Error(`Unsupported AI provider type: ${config.type}`);
    }
  }

  /**
   * Create multiple AI provider instances from an array of configurations
   * @param configs Array of provider configurations
   * @returns Array of provider instances, sorted by priority
   */
  static createProviders(configs: AIProviderConfig[]): BaseAIProvider[] {
    // Filter out disabled providers
    const enabledConfigs = configs.filter(config => config.enabled);
    
    // Sort by priority (lower number = higher priority)
    const sortedConfigs = [...enabledConfigs].sort((a, b) => a.priority - b.priority);
    
    // Create provider instances
    return sortedConfigs.map(config => this.createProvider(config));
  }
}

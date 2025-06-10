// src/config/ai-config.ts
import * as fs from 'fs';
import * as path from 'path';
import { AIProviderConfig } from '../ai-providers/base-provider';

/**
 * AI configuration interface
 */
export interface AIConfig {
  providers: AIProviderConfig[];
  healthCheckIntervalMs: number;
  defaultContext: 'admin' | 'ooc' | 'ic';
  functionCalling: boolean;
  maxHistoryMessages: number;
}

/**
 * Default AI configuration
 */
const defaultConfig: AIConfig = {
  providers: [
    {
      type: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'llama3',
      enabled: true,
      priority: 1,
      healthCheck: true,
      timeout: 30000,
      maxRetries: 3
    }
  ],
  healthCheckIntervalMs: 60000, // 1 minute
  defaultContext: 'ooc',
  functionCalling: true,
  maxHistoryMessages: 50
};

/**
 * Load AI configuration from file or use defaults
 * @param configPath Path to the configuration file
 * @returns The loaded configuration
 */
export function loadAIConfig(configPath?: string): AIConfig {
  // Use default path if not provided
  const filePath = configPath || path.join(process.cwd(), 'ai-config.json');
  
  try {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(fileContent) as Partial<AIConfig>;
      
      // Merge with defaults to ensure all fields are present
      return {
        ...defaultConfig,
        ...config,
        // Deep merge providers array
        providers: config.providers ? config.providers.map(provider => ({
          ...defaultConfig.providers[0],
          ...provider
        })) : defaultConfig.providers
      };
    }
  } catch (error) {
    console.warn(`Failed to load AI config from ${filePath}:`, error instanceof Error ? error.message : String(error));
    console.warn('Using default configuration');
  }
  
  // Return default config if file doesn't exist or loading failed
  return defaultConfig;
}

/**
 * Save AI configuration to file
 * @param config The configuration to save
 * @param configPath Path to the configuration file
 * @returns True if the save was successful
 */
export function saveAIConfig(config: AIConfig, configPath?: string): boolean {
  // Use default path if not provided
  const filePath = configPath || path.join(process.cwd(), 'ai-config.json');
  
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the config to file
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`AI configuration saved to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to save AI config to ${filePath}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Validate AI configuration
 * @param config The configuration to validate
 * @returns An array of validation errors, empty if valid
 */
export function validateAIConfig(config: AIConfig): string[] {
  const errors: string[] = [];
  
  // Check if there's at least one provider
  if (!config.providers || config.providers.length === 0) {
    errors.push('No AI providers configured');
  } else {
    // Check each provider
    config.providers.forEach((provider, index) => {
      if (!provider.type) {
        errors.push(`Provider ${index + 1} is missing a type`);
      }
      
      if (!provider.endpoint) {
        errors.push(`Provider ${index + 1} is missing an endpoint`);
      }
      
      if (!provider.model) {
        errors.push(`Provider ${index + 1} is missing a model`);
      }
    });
  }
  
  // Check health check interval
  if (config.healthCheckIntervalMs !== undefined && config.healthCheckIntervalMs < 1000) {
    errors.push('Health check interval must be at least 1000ms (1 second)');
  }
  
  // Check default context
  if (config.defaultContext && !['admin', 'ooc', 'ic'].includes(config.defaultContext)) {
    errors.push('Default context must be one of: admin, ooc, ic');
  }
  
  // Check max history messages
  if (config.maxHistoryMessages !== undefined && config.maxHistoryMessages < 1) {
    errors.push('Max history messages must be at least 1');
  }
  
  return errors;
}

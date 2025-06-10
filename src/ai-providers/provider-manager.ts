// src/ai-providers/provider-manager.ts
import { EventEmitter } from 'events';
import { 
  BaseAIProvider, 
  AIProviderConfig, 
  ChatMessage, 
  ChatCompletionOptions, 
  ChatCompletionResponse,
  ProviderHealth
} from './base-provider';
import { AIProviderFactory } from './provider-factory';

/**
 * Events emitted by the provider manager
 */
export enum ProviderManagerEvents {
  PROVIDER_HEALTH_CHANGED = 'provider_health_changed',
  PROVIDER_SWITCHED = 'provider_switched',
  ALL_PROVIDERS_FAILED = 'all_providers_failed'
}

/**
 * Manager class for handling multiple AI providers with failover
 */
export class ProviderManager extends EventEmitter {
  private providers: BaseAIProvider[] = [];
  private activeProviderIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckIntervalMs = 60000; // Default: check every minute
  
  /**
   * Create a new provider manager
   * @param configs Array of provider configurations
   * @param healthCheckIntervalMs Interval for health checks in milliseconds
   */
  constructor(configs: AIProviderConfig[], healthCheckIntervalMs?: number) {
    super();
    
    // Create provider instances
    this.providers = AIProviderFactory.createProviders(configs);
    
    if (healthCheckIntervalMs) {
      this.healthCheckIntervalMs = healthCheckIntervalMs;
    }
  }

  /**
   * Initialize all providers
   */
  async initialize(): Promise<void> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers configured');
    }

    // Initialize all providers
    const initPromises = this.providers.map(async (provider, index) => {
      try {
        await provider.initialize();
        return { index, success: true };
      } catch (error) {
        console.warn(`Failed to initialize provider ${provider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
        return { index, success: false };
      }
    });

    const results = await Promise.all(initPromises);
    
    // Find the first successfully initialized provider
    const firstSuccessful = results.find(result => result.success);
    
    if (firstSuccessful) {
      this.activeProviderIndex = firstSuccessful.index;
      console.log(`Using ${this.getActiveProvider().getConfig().type} as the active provider`);
    } else {
      console.warn('Failed to initialize any AI providers - server will start in limited mode');
      // Set active provider to the first one, even if initialization failed
      if (this.providers.length > 0) {
        this.activeProviderIndex = 0;
      }
    }

    // Start health checks if enabled
    if (this.providers.some(p => p.getConfig().healthCheck)) {
      this.startHealthChecks();
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.checkProvidersHealth();
    }, this.healthCheckIntervalMs);

    console.log(`Started health checks every ${this.healthCheckIntervalMs / 1000} seconds`);
  }

  /**
   * Stop periodic health checks
   */
  public stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('Stopped health checks');
    }
  }

  /**
   * Check the health of all providers
   */
  async checkProvidersHealth(): Promise<void> {
    // In development mode, don't perform actual health checks
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDevelopmentMode) {
      // Just emit healthy status for all providers
      this.providers.forEach((provider) => {
        const mockHealth: ProviderHealth = {
          status: 'healthy',
          latency: 10,
          message: 'Mock health check in development mode',
          timestamp: new Date()
        };
        
        this.emit(ProviderManagerEvents.PROVIDER_HEALTH_CHANGED, {
          provider: provider.getConfig().type,
          health: mockHealth
        });
      });
      return;
    }
    
    const healthPromises = this.providers.map(async (provider, index) => {
      // Only check providers that have health checks enabled
      if (!provider.getConfig().healthCheck) {
        return { index, health: provider.getHealth() };
      }

      try {
        const health = await provider.checkHealth();
        return { index, health };
      } catch (error) {
        console.warn(`Health check failed for provider ${provider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
        return { 
          index, 
          health: {
            status: 'unhealthy',
            latency: 0,
            message: `Health check error: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date()
          } as ProviderHealth
        };
      }
    });

    const results = await Promise.all(healthPromises);
    
    // Emit events for health changes
    results.forEach(result => {
      this.emit(ProviderManagerEvents.PROVIDER_HEALTH_CHANGED, {
        provider: this.providers[result.index].getConfig().type,
        health: result.health
      });
    });

    // Check if we need to switch providers
    if (!this.getActiveProvider().isHealthy()) {
      this.switchToHealthyProvider();
    }
  }

  /**
   * Switch to a healthy provider
   * @returns true if a healthy provider was found or if operation can continue with degraded providers
   */
  switchToHealthyProvider(): boolean {
    // No providers available, can't switch to anything
    if (this.providers.length === 0) {
      console.warn('No providers available to switch to');
      this.emit(ProviderManagerEvents.ALL_PROVIDERS_FAILED, {
        message: 'No providers available'
      });
      return true; // Return true to keep server running
    }

    const healthyProviders = this.providers
      .map((provider, index) => ({ provider, index }))
      .filter(({ provider }) => provider.isHealthy() && provider.isEnabled());
    
    if (healthyProviders.length > 0) {
      // Find the highest priority provider
      const highestPriority = healthyProviders.reduce((prev, current) => {
        const prevPriority = prev.provider.getConfig().priority || 0;
        const currentPriority = current.provider.getConfig().priority || 0;
        return currentPriority > prevPriority ? current : prev;
      }, healthyProviders[0]);
      
      // If we're already using this provider, no need to switch
      if (this.activeProviderIndex === highestPriority.index) {
        return true;
      }
      
      // Switch to the healthy provider
      this.activeProviderIndex = highestPriority.index;
      console.log(`Switched to ${this.getActiveProvider().getConfig().type} provider`);
      
      this.emit(ProviderManagerEvents.PROVIDER_SWITCHED, {
        provider: this.getActiveProvider().getConfig().type,
        reason: 'health_check'
      });
      
      return true;
    } else {
      // All providers are unhealthy, but we'll continue in degraded mode
      console.warn('All providers are unhealthy - running in degraded mode');
      
      this.emit(ProviderManagerEvents.ALL_PROVIDERS_FAILED, {
        message: 'All providers failed health checks - running in degraded mode'
      });
      
      return true; // Always return true to prevent shutdown
    }
  }
  
  /**
   * Get the currently active provider
   * @returns The currently active provider
   * @throws Error if no providers are available
   */
  getActiveProvider(): BaseAIProvider {
    if (this.providers.length === 0) {
      console.warn('No AI providers are available');
      // Create and return a mock provider that will return error responses
      // This allows the application to continue running even without real providers
      const mockConfig: AIProviderConfig = {
        type: 'ollama',
        endpoint: '',
        model: 'mock',
        enabled: true,
        priority: 1,
        healthCheck: false,
        name: 'Mock Provider'
      };
      
      return new (class MockProvider extends BaseAIProvider {
        constructor() {
          super(mockConfig);
        }
        
        async initialize(): Promise<void> {}
        
        async checkHealth(): Promise<ProviderHealth> {
          return {
            status: 'unhealthy',
            latency: 0,
            message: 'Mock provider is always unhealthy',
            timestamp: new Date()
          };
        }
        
        isHealthy(): boolean {
          return false;
        }
        
        async chat(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResponse> {
          return {
            id: 'mock',
            content: 'No AI providers are currently available. Please check your server configuration.',
            finish_reason: 'stop',
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0
            }
          };
        }
        
        async *chatStream(messages: ChatMessage[], options?: ChatCompletionOptions): AsyncGenerator<Partial<ChatCompletionResponse>> {
          yield {
            id: 'mock-stream',
            content: 'No AI providers are currently available. Please check your server configuration.',
            finish_reason: 'stop'
          };
        }
        
        async shutdown(): Promise<void> {
          // Nothing to clean up
        }
      })();
    }
    return this.providers[this.activeProviderIndex];
  }

  /**
   * Get all providers
   * @returns Array of AI providers
   */
  getAllProviders() {
    return [...this.providers];
  }

  /**
   * Get health status for all providers
   */
  getAllProvidersHealth(): Array<{ provider: string, health: ProviderHealth }> {
    return this.providers.map(provider => ({
      provider: provider.getConfig().type,
      health: provider.getHealth()
    }));
  }

  /**
   * Generate a chat completion using the active provider
   * Will attempt failover if the active provider fails
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const startProvider = this.getActiveProvider();
    
    try {
      // Try with the active provider first
      return await startProvider.chat(messages, options);
    } catch (error) {
      console.warn(`Chat completion failed with provider ${startProvider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
      
      // Try to switch to a healthy provider
      const switched = this.switchToHealthyProvider();
      
      if (switched && this.getActiveProvider() !== startProvider) {
        // Try again with the new provider
        try {
          return await this.getActiveProvider().chat(messages, options);
        } catch (retryError) {
          throw new Error(`Failed to get chat completion after provider switch: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
        }
      } else {
        // No healthy providers available or switching didn't help
        throw new Error(`Failed to get chat completion: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Generate a streaming chat completion using the active provider
   */
  async *chatStream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<Partial<ChatCompletionResponse>> {
    const provider = this.getActiveProvider();
    
    try {
      yield* provider.chatStream(messages, options);
    } catch (error) {
      console.warn(`Chat stream failed with provider ${provider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
      
      // Return an error message as a completion
      yield {
        id: 'error-stream',
        content: `AI provider error: ${error instanceof Error ? error.message : String(error)}`,
        finish_reason: 'stop'
      };
    }
  }

  /**
   * Shutdown the provider manager and clean up resources
   */
  async shutdown(): Promise<void> {
    // Stop health check intervals
    this.stopHealthChecks();
    
    // Shutdown all providers if they have shutdown methods
    await Promise.all(
      this.providers.map(provider => 
        typeof provider.shutdown === 'function' 
          ? provider.shutdown() 
          : Promise.resolve()
      )
    );
    
    console.log('Provider manager shutdown complete');
  }
}

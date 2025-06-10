# LLM Provider Simplification Plan

## Current Architecture Analysis

The current ProviderManager implementation has several complexities that go beyond the core functionality of connecting to LLM providers and sending/receiving messages:

1. **Multiple Provider Management**: Handles arrays of providers with priority ordering and switching
2. **Health Checking System**: Periodic health checks with intervals and automatic recovery
3. **Event System**: Complex event emission for health changes and provider switching
4. **Error Handling**: Elaborate error handling with fallback mechanisms
5. **Mock Provider Fallback**: Creates mock providers when no real providers are available

All these features add significant complexity that may be unnecessary for the core functionality.

## Simplified Architecture Proposal

### Core Principles

1. **Single Responsibility**: Focus only on provider connection and message exchange
2. **Configuration Simplicity**: Simple provider configuration without complex health check settings
3. **Error Transparency**: Clear error reporting without automatic recovery attempts
4. **Manual Control**: Allow manual provider selection rather than automatic switching

### New Architecture Components

1. **SimpleProviderClient**: A lightweight client for connecting to a single LLM provider
   - Handles connection to one provider type (ollama, openai, etc.)
   - Simple chat and stream methods
   - Basic error handling without recovery logic
   
2. **ProviderRegistry**: A simple registry for available provider types
   - Factory for creating appropriate provider clients
   - No automatic switching or health monitoring

## Implementation Plan

### Phase 1: Create SimpleProviderClient

1. Create new file `src/ai-providers/simple-provider-client.ts`
2. Implement basic provider connection and authentication
3. Add chat completion and streaming methods
4. Include simple error handling

### Phase 2: Create ProviderRegistry

1. Create new file `src/ai-providers/provider-registry.ts`
2. Implement provider factory methods
3. Add provider type validation
4. Create method to get available provider types

### Phase 3: Update API Routes

1. Create new endpoints for simplified provider management
2. Update chat endpoints to use new simplified clients
3. Deprecate but maintain old endpoints for backwards compatibility

### Phase 4: Update UI Integration

1. Update provider selection in UI to match the contextual color system:
   - Administrative Context (Level 1): Red for user, Green for AI
   - Out-of-Character Context (Level 2): Blue for player, Orange for AI
   - In-Character Context (Level 3): Green for player, Purple for AI
2. Simplify provider status display
3. Improve error messaging for provider issues

## Code Sketches

### SimpleProviderClient

```typescript
// simple-provider-client.ts
export class SimpleProviderClient {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  // Simple connection test
  async testConnection(): Promise<boolean> {
    try {
      // Basic connection test logic
      return true;
    } catch (error) {
      console.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  // Simple chat completion
  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      // Provider-specific implementation
      return response;
    } catch (error) {
      throw new Error(`Chat completion failed: ${error.message}`);
    }
  }

  // Simple streaming chat completion
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<Partial<ChatCompletionResponse>> {
    try {
      // Provider-specific streaming implementation
      yield chunk;
    } catch (error) {
      throw new Error(`Chat stream failed: ${error.message}`);
    }
  }
}
```

### ProviderRegistry

```typescript
// provider-registry.ts
export class ProviderRegistry {
  private static providerTypes = [
    'ollama',
    'openai',
    'lmstudio'
  ];

  // Get a client for the specified provider type
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
      // Additional cases for other provider types
      default:
        throw new Error(`Provider type ${config.type} not implemented`);
    }
  }

  // Get available provider types
  static getAvailableProviderTypes(): string[] {
    return [...this.providerTypes];
  }
}
```

## Expected Benefits

1. **Reduced Complexity**: Simpler codebase that's easier to maintain
2. **Better Error Visibility**: Clearer error messages without automatic recovery masking issues
3. **Easier Testing**: Simpler components are easier to test
4. **Improved Performance**: Less overhead from health checking and event systems
5. **Focused Development**: Clear separation between core messaging and advanced features

## Potential Drawbacks and Mitigations

1. **Reduced Reliability**: Without automatic failover, reliability might decrease
   - Mitigation: Add simple retry logic in the UI for failed requests

2. **Manual Provider Selection**: Users must manually switch providers if one fails
   - Mitigation: Clear error messaging and easy provider switching in UI

## Integration with UI Connection Checklist

This simplification aligns with the UI Connection Checklist milestones:

1. **Basic Component Functionality (Milestone 4)**: Simplify the provider components to focus on core messaging
2. **Event Handling and Basic Interactivity (Milestone 5)**: Implement manual provider selection and status display
3. **Advanced Interactivity and Polish (Milestone 8)**: Enhance error messaging and provider switching UI
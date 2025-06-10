# Provider Manager

## Overview
The ProviderManager class is a critical component in the aiGM system that manages multiple AI providers with failover capabilities. It ensures the application can continue running even if one or more AI providers become unavailable.

## Key Features
- Manages multiple AI providers with automatic failover
- Conducts periodic health checks
- Gracefully handles provider failures
- Provides a unified interface for chat completions
- Supports both standard and streaming chat completions

## Core Methods

### `initialize()`
Initializes all configured providers and selects the first working one as active.

### `getActiveProvider()`
Returns the currently active provider. If no providers are available, returns a mock provider that provides error responses.

### `getAllProviders()`
Returns an array of all configured providers.

### `chat(messages, options)`
Generates a chat completion using the active provider with failover support if the primary provider fails.

### `chatStream(messages, options)`
Generates a streaming chat completion using the active provider.

### `shutdown()`
Properly shuts down the provider manager and cleans up resources:
- Stops all health check intervals
- Calls shutdown() on each provider if available
- Returns a Promise that resolves when all providers are shut down

### Health Check System
The manager includes a sophisticated health check system that:
- Periodically checks the health of all providers
- Automatically switches to healthy providers when needed
- Emits events when provider health changes
- Continues operation in degraded mode if all providers fail

## Events
The ProviderManager emits the following events:
- `PROVIDER_HEALTH_CHANGED`: When a provider's health status changes
- `PROVIDER_SWITCHED`: When the active provider changes
- `ALL_PROVIDERS_FAILED`: When all providers are unavailable

## Configuration
Providers are configured using AIProviderConfig objects that specify:
- Provider type (e.g., 'ollama', 'openai', etc.)
- API endpoint
- Model name
- Priority (higher priority providers are preferred)
- Health check settings

"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = exports.ProviderManagerEvents = void 0;
// src/ai-providers/provider-manager.ts
const events_1 = require("events");
const base_provider_1 = require("./base-provider");
const provider_factory_1 = require("./provider-factory");
/**
 * Events emitted by the provider manager
 */
var ProviderManagerEvents;
(function (ProviderManagerEvents) {
    ProviderManagerEvents["PROVIDER_HEALTH_CHANGED"] = "provider_health_changed";
    ProviderManagerEvents["PROVIDER_SWITCHED"] = "provider_switched";
    ProviderManagerEvents["ALL_PROVIDERS_FAILED"] = "all_providers_failed";
})(ProviderManagerEvents || (exports.ProviderManagerEvents = ProviderManagerEvents = {}));
/**
 * Manager class for handling multiple AI providers with failover
 */
class ProviderManager extends events_1.EventEmitter {
    /**
     * Create a new provider manager
     * @param configs Array of provider configurations
     * @param healthCheckIntervalMs Interval for health checks in milliseconds
     */
    constructor(configs, healthCheckIntervalMs) {
        super();
        this.providers = [];
        this.activeProviderIndex = 0;
        this.healthCheckInterval = null;
        this.healthCheckIntervalMs = 60000; // Default: check every minute
        // Create provider instances
        this.providers = provider_factory_1.AIProviderFactory.createProviders(configs);
        if (healthCheckIntervalMs) {
            this.healthCheckIntervalMs = healthCheckIntervalMs;
        }
    }
    /**
     * Initialize all providers
     */
    async initialize() {
        if (this.providers.length === 0) {
            throw new Error('No AI providers configured');
        }
        // Initialize all providers
        const initPromises = this.providers.map(async (provider, index) => {
            try {
                await provider.initialize();
                return { index, success: true };
            }
            catch (error) {
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
        }
        else {
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
    startHealthChecks() {
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
    stopHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            console.log('Stopped health checks');
        }
    }
    /**
     * Check the health of all providers
     */
    async checkProvidersHealth() {
        // In development mode, don't perform actual health checks
        const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        if (isDevelopmentMode) {
            // Just emit healthy status for all providers
            this.providers.forEach((provider) => {
                const mockHealth = {
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
            }
            catch (error) {
                console.warn(`Health check failed for provider ${provider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
                return {
                    index,
                    health: {
                        status: 'unhealthy',
                        latency: 0,
                        message: `Health check error: ${error instanceof Error ? error.message : String(error)}`,
                        timestamp: new Date()
                    }
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
    switchToHealthyProvider() {
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
        }
        else {
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
    getActiveProvider() {
        if (this.providers.length === 0) {
            console.warn('No AI providers are available');
            // Create and return a mock provider that will return error responses
            // This allows the application to continue running even without real providers
            const mockConfig = {
                type: 'ollama',
                endpoint: '',
                model: 'mock',
                enabled: true,
                priority: 1,
                healthCheck: false,
                name: 'Mock Provider'
            };
            return new (class MockProvider extends base_provider_1.BaseAIProvider {
                constructor() {
                    super(mockConfig);
                }
                async initialize() { }
                async checkHealth() {
                    return {
                        status: 'unhealthy',
                        latency: 0,
                        message: 'Mock provider is always unhealthy',
                        timestamp: new Date()
                    };
                }
                isHealthy() {
                    return false;
                }
                async chat(messages, options) {
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
                chatStream(messages, options) {
                    return __asyncGenerator(this, arguments, function* chatStream_1() {
                        yield yield __await({
                            id: 'mock-stream',
                            content: 'No AI providers are currently available. Please check your server configuration.',
                            finish_reason: 'stop'
                        });
                    });
                }
                async shutdown() {
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
    getAllProvidersHealth() {
        return this.providers.map(provider => ({
            provider: provider.getConfig().type,
            health: provider.getHealth()
        }));
    }
    /**
     * Generate a chat completion using the active provider
     * Will attempt failover if the active provider fails
     */
    async chat(messages, options) {
        const startProvider = this.getActiveProvider();
        try {
            // Try with the active provider first
            return await startProvider.chat(messages, options);
        }
        catch (error) {
            console.warn(`Chat completion failed with provider ${startProvider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
            // Try to switch to a healthy provider
            const switched = this.switchToHealthyProvider();
            if (switched && this.getActiveProvider() !== startProvider) {
                // Try again with the new provider
                try {
                    return await this.getActiveProvider().chat(messages, options);
                }
                catch (retryError) {
                    throw new Error(`Failed to get chat completion after provider switch: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                }
            }
            else {
                // No healthy providers available or switching didn't help
                throw new Error(`Failed to get chat completion: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    /**
     * Generate a streaming chat completion using the active provider
     */
    chatStream(messages, options) {
        return __asyncGenerator(this, arguments, function* chatStream_2() {
            const provider = this.getActiveProvider();
            try {
                yield __await(yield* __asyncDelegator(__asyncValues(provider.chatStream(messages, options))));
            }
            catch (error) {
                console.warn(`Chat stream failed with provider ${provider.getConfig().type}:`, error instanceof Error ? error.message : String(error));
                // Return an error message as a completion
                yield yield __await({
                    id: 'error-stream',
                    content: `AI provider error: ${error instanceof Error ? error.message : String(error)}`,
                    finish_reason: 'stop'
                });
            }
        });
    }
    /**
     * Shutdown the provider manager and clean up resources
     */
    async shutdown() {
        // Stop health check intervals
        this.stopHealthChecks();
        // Shutdown all providers if they have shutdown methods
        await Promise.all(this.providers.map(provider => typeof provider.shutdown === 'function'
            ? provider.shutdown()
            : Promise.resolve()));
        console.log('Provider manager shutdown complete');
    }
}
exports.ProviderManager = ProviderManager;

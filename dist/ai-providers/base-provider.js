"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIProvider = void 0;
// src/ai-providers/base-provider.ts
const events_1 = require("events");
/**
 * Abstract base class for all AI providers
 */
class BaseAIProvider extends events_1.EventEmitter {
    constructor(config) {
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
    getConfig() {
        return Object.assign({}, this.config);
    }
    /**
     * Get the current health status of the provider
     */
    getHealth() {
        return Object.assign({}, this.health);
    }
    /**
     * Check if the provider is healthy
     */
    isHealthy() {
        return this.health.status === 'healthy';
    }
    /**
     * Check if the provider is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
}
exports.BaseAIProvider = BaseAIProvider;

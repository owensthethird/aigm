"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAIConfig = loadAIConfig;
exports.saveAIConfig = saveAIConfig;
exports.validateAIConfig = validateAIConfig;
// src/config/ai-config.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Default AI configuration
 */
const defaultConfig = {
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
function loadAIConfig(configPath) {
    // Use default path if not provided
    const filePath = configPath || path.join(process.cwd(), 'ai-config.json');
    try {
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const config = JSON.parse(fileContent);
            // Merge with defaults to ensure all fields are present
            return Object.assign(Object.assign(Object.assign({}, defaultConfig), config), { 
                // Deep merge providers array
                providers: config.providers ? config.providers.map(provider => (Object.assign(Object.assign({}, defaultConfig.providers[0]), provider))) : defaultConfig.providers });
        }
    }
    catch (error) {
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
function saveAIConfig(config, configPath) {
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
    }
    catch (error) {
        console.error(`Failed to save AI config to ${filePath}:`, error instanceof Error ? error.message : String(error));
        return false;
    }
}
/**
 * Validate AI configuration
 * @param config The configuration to validate
 * @returns An array of validation errors, empty if valid
 */
function validateAIConfig(config) {
    const errors = [];
    // Check if there's at least one provider
    if (!config.providers || config.providers.length === 0) {
        errors.push('No AI providers configured');
    }
    else {
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

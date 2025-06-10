"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
// src/ai-providers/ollama-provider.ts
const axios_1 = __importDefault(require("axios"));
const base_provider_1 = require("./base-provider");
/**
 * Implementation of the Ollama AI provider
 */
class OllamaProvider extends base_provider_1.BaseAIProvider {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { type: 'ollama' }));
        // Create axios client for Ollama API
        this.client = axios_1.default.create({
            baseURL: config.endpoint,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.requestConfig = {
            timeout: config.timeout || 30000
        };
    }
    /**
     * Initialize the Ollama provider
     */
    async initialize() {
        try {
            // Check if Ollama is available
            const health = await this.checkHealth();
            if (health.status === 'healthy') {
                console.log(`Ollama provider initialized successfully at ${this.config.endpoint}`);
                console.log(`Using model: ${this.config.model}`);
            }
            else {
                console.warn(`Ollama provider initialized but health check failed: ${health.message}`);
            }
        }
        catch (error) {
            console.error('Failed to initialize Ollama provider:', error instanceof Error ? error.message : String(error));
            throw new Error(`Ollama provider initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Check the health of the Ollama provider
     */
    async checkHealth() {
        const startTime = Date.now();
        try {
            // Ollama doesn't have a dedicated health endpoint, so we'll use the list models endpoint
            const response = await this.client.get('/api/tags', this.requestConfig);
            const latency = Date.now() - startTime;
            if (response.status === 200) {
                // Check if our configured model is available
                const models = response.data.models || [];
                const modelAvailable = models.some((model) => model.name === this.config.model);
                if (modelAvailable) {
                    this.health = {
                        status: 'healthy',
                        latency,
                        message: 'Ollama is available and model is loaded',
                        timestamp: new Date()
                    };
                }
                else {
                    this.health = {
                        status: 'degraded',
                        latency,
                        message: `Ollama is available but model '${this.config.model}' is not loaded`,
                        timestamp: new Date()
                    };
                }
            }
            else {
                this.health = {
                    status: 'unhealthy',
                    latency,
                    message: `Unexpected response from Ollama: ${response.status}`,
                    timestamp: new Date()
                };
            }
        }
        catch (error) {
            const latency = Date.now() - startTime;
            this.health = {
                status: 'unhealthy',
                latency,
                message: `Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date()
            };
        }
        return this.health;
    }
    /**
     * Convert standard chat messages to Ollama format
     */
    formatMessages(messages) {
        return messages.map(msg => {
            // Ollama uses 'system' for system messages, 'user' for user, and 'assistant' for assistant
            return {
                role: msg.role,
                content: msg.content
            };
        });
    }
    /**
     * Generate a chat completion using Ollama
     */
    async chat(messages, options) {
        try {
            const formattedMessages = this.formatMessages(messages);
            const requestBody = {
                model: this.config.model,
                messages: formattedMessages,
                stream: false,
                options: {
                    temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7,
                    num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                    // Add Ollama-specific options here
                }
            };
            // Handle function calling if provided
            if ((options === null || options === void 0 ? void 0 : options.functions) && options.functions.length > 0) {
                // Ollama doesn't natively support function calling, so we'll implement it via prompt engineering
                // Add function definitions to the system prompt
                const functionDefinitions = JSON.stringify(options.functions);
                const systemMessage = messages.find(m => m.role === 'system');
                if (systemMessage) {
                    systemMessage.content += `\n\nYou have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`;
                }
                else {
                    // Add a new system message if one doesn't exist
                    messages.unshift({
                        role: 'system',
                        content: `You have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`
                    });
                }
            }
            const response = await this.client.post('/api/chat', requestBody, this.requestConfig);
            // Parse the response
            const result = response.data;
            // Check if the response contains a function call (our custom implementation)
            let functionCall = undefined;
            try {
                // Try to parse the response as JSON to check for function calls
                const parsedResponse = JSON.parse(result.message.content);
                if (parsedResponse.function_call) {
                    functionCall = {
                        name: parsedResponse.function_call.name,
                        arguments: JSON.stringify(parsedResponse.function_call.arguments)
                    };
                }
            }
            catch (e) {
                // Not JSON or doesn't contain function_call, which is fine
            }
            return {
                id: result.id || `ollama-${Date.now()}`,
                content: functionCall ? '' : result.message.content,
                function_call: functionCall,
                finish_reason: functionCall ? 'function_call' : 'stop',
                usage: {
                    prompt_tokens: result.prompt_eval_count || 0,
                    completion_tokens: result.eval_count || 0,
                    total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0)
                }
            };
        }
        catch (error) {
            console.error('Ollama chat completion error:', error instanceof Error ? error.message : String(error));
            throw new Error(`Ollama chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate a streaming chat completion using Ollama
     */
    chatStream(messages, options) {
        return __asyncGenerator(this, arguments, function* chatStream_1() {
            var _a, e_1, _b, _c;
            try {
                const formattedMessages = this.formatMessages(messages);
                const requestBody = {
                    model: this.config.model,
                    messages: formattedMessages,
                    stream: true,
                    options: {
                        temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7,
                        num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                        // Add Ollama-specific options here
                    }
                };
                // Handle function calling if provided (same as in chat method)
                if ((options === null || options === void 0 ? void 0 : options.functions) && options.functions.length > 0) {
                    const functionDefinitions = JSON.stringify(options.functions);
                    const systemMessage = messages.find(m => m.role === 'system');
                    if (systemMessage) {
                        systemMessage.content += `\n\nYou have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`;
                    }
                    else {
                        messages.unshift({
                            role: 'system',
                            content: `You have access to the following functions:\n${functionDefinitions}\n\nTo use a function, respond with a JSON object with a "function_call" property containing "name" and "arguments".`
                        });
                    }
                }
                const response = yield __await(this.client.post('/api/chat', requestBody, Object.assign(Object.assign({}, this.requestConfig), { responseType: 'stream' })));
                // Process the stream
                const stream = response.data;
                let buffer = '';
                let responseId = `ollama-${Date.now()}`;
                try {
                    for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a; _d = true) {
                        _c = stream_1_1.value;
                        _d = false;
                        const chunk = _c;
                        const text = chunk.toString();
                        buffer += text;
                        // Try to parse JSON objects from the buffer
                        try {
                            const result = JSON.parse(buffer);
                            buffer = '';
                            // Check if this is a done message
                            if (result.done) {
                                // Final message with usage stats
                                yield yield __await({
                                    id: responseId,
                                    finish_reason: 'stop',
                                    usage: {
                                        prompt_tokens: result.prompt_eval_count || 0,
                                        completion_tokens: result.eval_count || 0,
                                        total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0)
                                    }
                                });
                            }
                            else {
                                // Content chunk
                                if (result.message && result.message.content) {
                                    yield yield __await({
                                        id: responseId,
                                        content: result.message.content
                                    });
                                }
                            }
                        }
                        catch (e) {
                            // Not a complete JSON object yet, continue collecting chunks
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = stream_1.return)) yield __await(_b.call(stream_1));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            catch (error) {
                console.error('Ollama streaming chat completion error:', error instanceof Error ? error.message : String(error));
                throw new Error(`Ollama streaming chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    /**
     * Shutdown the Ollama provider
     */
    async shutdown() {
        // Nothing specific to clean up for Ollama
        console.log('Ollama provider shut down');
    }
}
exports.OllamaProvider = OllamaProvider;

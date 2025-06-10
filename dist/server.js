"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
// src/server.ts
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const database_1 = require("./database");
const provider_manager_1 = require("./ai-providers/provider-manager");
const ai_data_1 = require("./data/ai-data");
const chat_service_1 = require("./services/chat-service");
const websocket_server_1 = require("./websocket/websocket-server");
const chat_1 = require("./routes/chat");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load configuration
const loadConfig = () => {
    try {
        const configPath = path_1.default.resolve(__dirname, '../ai-config.json');
        const configData = fs_1.default.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    }
    catch (error) {
        console.error('Failed to load config:', error instanceof Error ? error.message : String(error));
        return {
            providers: [
                {
                    type: 'ollama',
                    endpoint: 'http://localhost:11434',
                    model: 'llama3',
                    enabled: true,
                    priority: 1,
                    healthCheck: true
                }
            ],
            healthCheckIntervalMs: 60000,
            defaultContext: 'ooc'
        };
    }
};
// Set up global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Don't exit the process in development mode
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    // Don't exit the process in development mode
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
// Initialize the server
const initServer = async () => {
    // Load configuration
    const config = loadConfig();
    // Create Express app
    const app = (0, express_1.default)();
    // Configure middleware
    app.use((0, cors_1.default)());
    app.use((0, body_parser_1.json)());
    app.use((0, body_parser_1.urlencoded)({ extended: true }));
    // Create HTTP server
    const server = http_1.default.createServer(app);
    try {
        // Database connection variables
        let db = null;
        let aiDataAccess = null;
        let chatDataAccess = null;
        let providerConfigs = [];
        try {
            // Try to connect to database
            db = new database_1.N8nDatabase({
                host: config.db.host,
                port: config.db.port,
                database: config.db.database,
                user: config.db.user,
                password: config.db.password
            });
            await db.connect();
            console.log('Connected to database');
            // Initialize data access layers
            aiDataAccess = new ai_data_1.AIDataAccess(db);
            chatDataAccess = new ai_data_1.ChatDataAccess(db);
            // Get AI provider configs from database
            providerConfigs = await aiDataAccess.getAllProviders();
        }
        catch (dbError) {
            console.warn('Database connection failed:', dbError instanceof Error ? dbError.message : String(dbError));
            console.log('Running in development mode with mock data');
            // Use mock data for development
            providerConfigs = [
                {
                    id: 1,
                    name: 'Mock Ollama',
                    type: 'ollama',
                    endpoint: 'http://localhost:11434',
                    model: 'llama3',
                    enabled: true,
                    priority: 1,
                    healthCheck: false // Disable health checks in development mode
                }
            ];
        }
        // Initialize provider manager
        const providerManager = new provider_manager_1.ProviderManager(providerConfigs.map(p => ({
            type: p.type,
            endpoint: p.endpoint,
            model: p.model,
            enabled: p.enabled,
            priority: p.priority,
            healthCheck: p.healthCheck,
            timeout: p.timeout,
            maxRetries: p.maxRetries,
            id: p.id,
            name: p.name
        })), config.healthCheckIntervalMs);
        await providerManager.initialize();
        console.log('AI provider manager initialized');
        // In development mode with mock data, don't start health checks
        if (!db || config.developmentMode) {
            console.log('Development mode detected: health checks disabled');
            providerManager.stopHealthChecks();
        }
        // Handle provider manager events
        providerManager.on(provider_manager_1.ProviderManagerEvents.ALL_PROVIDERS_FAILED, (data) => {
            console.warn('All providers are unhealthy:', data.message);
            console.log('Continuing to run in development mode with unhealthy providers');
            // Don't shut down the server, just log the warning
        });
        // Initialize WebSocket server
        const websocketServer = new websocket_server_1.WebSocketServer();
        websocketServer.initialize(server);
        console.log('WebSocket server initialized');
        // Initialize chat service with mock data if needed
        const chatService = new chat_service_1.ChatService(providerManager, chatDataAccess || {
            saveMessage: async () => ({ id: 'mock-id', timestamp: new Date() }),
            getMessages: async () => [],
            getMessagesByContext: async () => []
        }, websocketServer);
        // Initialize routes
        app.use('/api/chat', (0, chat_1.initChatRoutes)(chatService));
        // Add health check endpoint
        app.get('/health', (req, res) => {
            res.json({ status: 'ok' });
        });
        // Start server
        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        // Handle shutdown
        const shutdown = async (forceExit = false) => {
            console.log('Shutting down server...');
            // Shutdown provider manager
            await providerManager.shutdown();
            // Shutdown WebSocket server
            websocketServer.shutdown();
            // Disconnect from database if connected
            if (db) {
                await db.disconnect();
            }
            console.log('Server shutdown complete');
            // Only exit the process if forceExit is true or not in development mode
            if (forceExit || (!config.developmentMode && process.env.NODE_ENV !== 'development')) {
                process.exit(0);
            }
            else {
                console.log('Development mode: keeping process alive for debugging');
            }
        };
        // Handle process termination
        process.on('SIGINT', () => shutdown(true)); // Force exit on ctrl+c
        process.on('SIGTERM', () => shutdown(true)); // Force exit on SIGTERM
    }
    catch (error) {
        console.error('Failed to initialize server:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
};
exports.initServer = initServer;
// Global error handlers to prevent unexpected shutdowns
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION - keeping server alive:', error instanceof Error ? error.stack : String(error));
    // Don't exit the process
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION - keeping server alive:', reason instanceof Error ? reason.stack : String(reason));
    // Don't exit the process
});
// Start the server if this file is run directly
if (require.main === module) {
    (0, exports.initServer)().catch(error => {
        console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
        // Don't exit on initialization errors either
        console.log('Server initialization failed, but process kept alive for debugging');
    });
}
// Export is already done above

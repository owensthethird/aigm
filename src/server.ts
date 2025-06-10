// src/server.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { N8nDatabase } from './database';
import { ProviderManager, ProviderManagerEvents } from './ai-providers/provider-manager';
import { AIDataAccess, ChatDataAccess } from './data/ai-data';
import { ChatService } from './services/chat-service';
import { WebSocketServer } from './websocket/websocket-server';
import chatRoutes, { initChatRoutes } from './routes/chat';
import simpleProviderRoutes from './ai-providers/simple-provider-routes';
import fs from 'fs';
import path from 'path';

// Load configuration
const loadConfig = () => {
  try {
    const configPath = path.resolve(__dirname, '../ai-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
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
export const initServer = async () => {
  // Load configuration
  const config = loadConfig();
  
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  // Create HTTP server
  const server = http.createServer(app);
  
  try {
    // Database connection variables
    let db: N8nDatabase | null = null;
    let aiDataAccess: AIDataAccess | null = null;
    let chatDataAccess: ChatDataAccess | null = null;
    let providerConfigs: any[] = [];
    
    try {
      // Try to connect to database
      db = new N8nDatabase({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password
      });
      
      await db.connect();
      console.log('Connected to database');
      
      // Initialize data access layers
      aiDataAccess = new AIDataAccess(db);
      chatDataAccess = new ChatDataAccess(db);
      
      // Get AI provider configs from database
      providerConfigs = await aiDataAccess.getAllProviders();
    } catch (dbError) {
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
    const providerManager = new ProviderManager(
      providerConfigs.map(p => ({
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
      })),
      config.healthCheckIntervalMs
    );
    
    await providerManager.initialize();
    console.log('AI provider manager initialized');
    
    // In development mode with mock data, don't start health checks
    if (!db || config.developmentMode) {
      console.log('Development mode detected: health checks disabled');
      providerManager.stopHealthChecks();
    }
    
    // Handle provider manager events
    providerManager.on(ProviderManagerEvents.ALL_PROVIDERS_FAILED, (data) => {
      console.warn('All providers are unhealthy:', data.message);
      console.log('Continuing to run in development mode with unhealthy providers');
      // Don't shut down the server, just log the warning
    });
    
    // Initialize WebSocket server
    const websocketServer = new WebSocketServer();
    websocketServer.initialize(server);
    console.log('WebSocket server initialized');
    
    // Initialize chat service with mock data if needed
    const chatService = new ChatService(
      providerManager,
      chatDataAccess || {
        saveMessage: async () => ({ id: 'mock-id', timestamp: new Date() }),
        getMessages: async () => [],
        getMessagesByContext: async () => []
      } as any,
      websocketServer
    );
    
    // Initialize routes
    app.use('/api/chat', initChatRoutes(chatService));
    
    // Add simplified provider routes
    app.use('/api/v2', simpleProviderRoutes);
    
    // Add health check endpoint
    app.get('/health', (req: express.Request, res: express.Response) => {
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
      } else {
        console.log('Development mode: keeping process alive for debugging');
      }
    };
    
    // Handle process termination
    process.on('SIGINT', () => shutdown(true)); // Force exit on ctrl+c
    process.on('SIGTERM', () => shutdown(true)); // Force exit on SIGTERM
    
  } catch (error) {
    console.error('Failed to initialize server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

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
  initServer().catch(error => {
    console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
    // Don't exit on initialization errors either
    console.log('Server initialization failed, but process kept alive for debugging');
  });
}

// Export is already done above

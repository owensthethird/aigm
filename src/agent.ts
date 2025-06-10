// src/agent.ts
import { N8nClient, N8nConfig } from './n8n-client';
import { N8nDatabase, DatabaseConfig } from './database';

export interface AgentConfig {
  n8n: N8nConfig;
  database: DatabaseConfig;
}

export class N8nAgent {
  public client: N8nClient;
  public database: N8nDatabase;

  constructor(config: AgentConfig) {
    this.client = new N8nClient(config.n8n);
    this.database = new N8nDatabase(config.database);
  }

  async initialize(): Promise<void> {
    // Test n8n API connection first
    try {
      const health = await this.client.getHealth();
      console.log('n8n API connected:', health.status);
    } catch (error) {
      console.error('n8n API connection failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  
    // Try database connection (optional)
    try {
      await this.database.connect();
      console.log('Database connected');
    } catch (error) {
      console.warn('Database connection failed (this is OK for testing):', error instanceof Error ? error.message : String(error));
      // Don't throw - continue without database
    }
  }

  async shutdown(): Promise<void> {
    await this.database.disconnect();
    console.log('Agent shutdown complete');
  }

  async getSystemStatus(): Promise<any> {
    try {
      // Test n8n health
      const n8nHealth = await this.client.getHealth();
      
      // Get some basic stats
      const workflows = await this.client.getWorkflows();
      const executions = await this.client.getExecutions(undefined, 10);
      
      const status: any = {
        n8n: {
          status: n8nHealth.status,
          workflows: workflows.length,
          activeWorkflows: workflows.filter(w => w.active).length
        },
        executions: {
          recent: executions.length,
          lastExecution: executions[0]?.startedAt || 'none'
        }
      };
  
      // Try database test (optional)
      try {
        const dbTest = await this.database.query('SELECT NOW()');
        status.database = {
          connected: true,
          timestamp: dbTest.rows[0].now
        };
      } catch (error) {
        status.database = {
          connected: false,
          error: 'Database not available'
        };
      }
  
      return status;
    } catch (error) {
      throw new Error(`System status check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
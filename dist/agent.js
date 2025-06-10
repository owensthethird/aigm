"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nAgent = void 0;
// src/agent.ts
const n8n_client_1 = require("./n8n-client");
const database_1 = require("./database");
class N8nAgent {
    constructor(config) {
        this.client = new n8n_client_1.N8nClient(config.n8n);
        this.database = new database_1.N8nDatabase(config.database);
    }
    async initialize() {
        // Test n8n API connection first
        try {
            const health = await this.client.getHealth();
            console.log('n8n API connected:', health.status);
        }
        catch (error) {
            console.error('n8n API connection failed:', error instanceof Error ? error.message : String(error));
            throw error;
        }
        // Try database connection (optional)
        try {
            await this.database.connect();
            console.log('Database connected');
        }
        catch (error) {
            console.warn('Database connection failed (this is OK for testing):', error instanceof Error ? error.message : String(error));
            // Don't throw - continue without database
        }
    }
    async shutdown() {
        await this.database.disconnect();
        console.log('Agent shutdown complete');
    }
    async getSystemStatus() {
        var _a;
        try {
            // Test n8n health
            const n8nHealth = await this.client.getHealth();
            // Get some basic stats
            const workflows = await this.client.getWorkflows();
            const executions = await this.client.getExecutions(undefined, 10);
            const status = {
                n8n: {
                    status: n8nHealth.status,
                    workflows: workflows.length,
                    activeWorkflows: workflows.filter(w => w.active).length
                },
                executions: {
                    recent: executions.length,
                    lastExecution: ((_a = executions[0]) === null || _a === void 0 ? void 0 : _a.startedAt) || 'none'
                }
            };
            // Try database test (optional)
            try {
                const dbTest = await this.database.query('SELECT NOW()');
                status.database = {
                    connected: true,
                    timestamp: dbTest.rows[0].now
                };
            }
            catch (error) {
                status.database = {
                    connected: false,
                    error: 'Database not available'
                };
            }
            return status;
        }
        catch (error) {
            throw new Error(`System status check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.N8nAgent = N8nAgent;

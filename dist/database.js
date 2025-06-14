"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nDatabase = void 0;
// src/database.ts
const pg_1 = require("pg");
class N8nDatabase {
    constructor(config) {
        this.pool = new pg_1.Pool(config);
    }
    async connect() {
        try {
            await this.pool.query('SELECT NOW()');
            console.log('Connected to n8n database');
        }
        catch (error) {
            console.error('Database connection failed:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
    async disconnect() {
        await this.pool.end();
    }
    async query(text, params) {
        return await this.pool.query(text, params);
    }
    // Get workflow executions with detailed data
    async getExecutionDetails(workflowId, limit = 100) {
        const query = `
     SELECT 
       e.id,
       e."workflowId",
       e.mode,
       e."retryOf",
       e.status,
       e."startedAt",
       e."stoppedAt",
       w.name as workflow_name,
       ed.data as execution_data
     FROM execution_entity e
     LEFT JOIN workflow_entity w ON e."workflowId" = w.id
     LEFT JOIN execution_data ed ON e.id = ed."executionId"
     ${workflowId ? 'WHERE e."workflowId" = $1' : ''}
     ORDER BY e."startedAt" DESC
     LIMIT ${workflowId ? '$2' : '$1'}
   `;
        const params = workflowId ? [workflowId, limit] : [limit];
        const result = await this.pool.query(query, params);
        return result.rows.map(row => ({
            id: row.id,
            workflowId: row.workflowId,
            mode: row.mode,
            retryOf: row.retryOf,
            status: row.status,
            startedAt: row.startedAt,
            stoppedAt: row.stoppedAt,
            workflowData: { name: row.workflow_name },
            data: row.execution_data
        }));
    }
    // Get execution analytics
    async getExecutionAnalytics(workflowId, days = 30) {
        var _a;
        const whereClause = workflowId ? 'WHERE "workflowId" = $2' : '';
        const dateParam = workflowId ? '$3' : '$2';
        const query = `
     WITH daily_stats AS (
       SELECT 
         DATE("startedAt") as date,
         COUNT(*) as executions,
         COUNT(*) FILTER (WHERE status = 'error') as errors,
         AVG(EXTRACT(EPOCH FROM ("stoppedAt" - "startedAt"))) as avg_duration
       FROM execution_entity 
       ${whereClause}
       AND "startedAt" >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE("startedAt")
       ORDER BY date DESC
     ),
     totals AS (
       SELECT 
         COUNT(*) as total_executions,
         COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate,
         AVG(EXTRACT(EPOCH FROM ("stoppedAt" - "startedAt"))) as avg_duration,
         COUNT(*) FILTER (WHERE status = 'error') as error_count
       FROM execution_entity 
       ${whereClause}
       AND "startedAt" >= NOW() - INTERVAL '${days} days'
     )
     SELECT 
       json_build_object(
         'totalExecutions', t.total_executions,
         'successRate', COALESCE(t.success_rate, 0),
         'averageDuration', COALESCE(t.avg_duration, 0),
         'errorCount', t.error_count,
         'dailyStats', COALESCE(array_agg(
           json_build_object(
             'date', ds.date,
             'executions', ds.executions,
             'errors', ds.errors
           ) ORDER BY ds.date DESC
         ) FILTER (WHERE ds.date IS NOT NULL), '[]')
       ) as analytics
     FROM totals t
     LEFT JOIN daily_stats ds ON true
     GROUP BY t.total_executions, t.success_rate, t.avg_duration, t.error_count
   `;
        const params = workflowId ? [workflowId] : [];
        const result = await this.pool.query(query, params);
        return ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.analytics) || {
            totalExecutions: 0,
            successRate: 0,
            averageDuration: 0,
            errorCount: 0,
            dailyStats: []
        };
    }
    // Get game session data (custom for your RPG)
    async getGameSessions(limit = 50) {
        const query = `
     SELECT 
       e.id,
       e."startedAt",
       ed.data->>'session_id' as session_id,
       ed.data->>'character' as character_data,
       ed.data->>'context' as game_context,
       ed.data->>'response' as gm_response
     FROM execution_entity e
     LEFT JOIN execution_data ed ON e.id = ed."executionId"
     WHERE ed.data->>'session_id' IS NOT NULL
     ORDER BY e."startedAt" DESC
     LIMIT $1
   `;
        const result = await this.pool.query(query, [limit]);
        return result.rows;
    }
    // Get player statistics
    async getPlayerStats(sessionId) {
        const whereClause = sessionId ? `AND ed.data->>'session_id' = $2` : '';
        const query = `
     SELECT 
       ed.data->>'session_id' as session_id,
       COUNT(*) as total_actions,
       MAX(ed.data->'context'->>'turn') as max_turn,
       ed.data->'character'->>'name' as character_name,
       ed.data->'character'->>'class' as character_class,
       ed.data->'character'->>'level' as character_level,
       MIN(e."startedAt") as first_action,
       MAX(e."startedAt") as last_action
     FROM execution_entity e
     LEFT JOIN execution_data ed ON e.id = ed."executionId"
     WHERE ed.data->>'session_id' IS NOT NULL
     ${whereClause}
     GROUP BY ed.data->>'session_id', ed.data->'character'->>'name', 
              ed.data->'character'->>'class', ed.data->'character'->>'level'
     ORDER BY last_action DESC
     ${sessionId ? '' : 'LIMIT 20'}
   `;
        const params = sessionId ? [sessionId] : [];
        const result = await this.pool.query(query, params);
        return sessionId ? result.rows[0] : result.rows;
    }
}
exports.N8nDatabase = N8nDatabase;

// src/data/ai-data.ts
import { N8nDatabase } from '../database';
import { AIProviderConfig } from '../ai-providers/base-provider';

/**
 * Database interface for AI-related data
 */
export class AIDataAccess {
  private db: N8nDatabase;

  constructor(db: N8nDatabase) {
    this.db = db;
  }

  /**
   * Get all AI providers from the database
   */
  async getAllProviders(): Promise<Array<AIProviderConfig & { id: number, name: string }>> {
    try {
      const result = await this.db.query(`
        SELECT id, name, type, endpoint, model, config, enabled, priority
        FROM ai_providers
        ORDER BY priority ASC
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type as 'ollama' | 'lmstudio' | 'openapi' | 'openai',
        endpoint: row.endpoint,
        model: row.model,
        enabled: row.enabled,
        priority: row.priority,
        healthCheck: row.config?.healthCheck ?? true,
        timeout: row.config?.timeout,
        maxRetries: row.config?.maxRetries
      }));
    } catch (error) {
      console.error('Failed to get AI providers:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get a specific AI provider by ID
   */
  async getProviderById(id: number): Promise<(AIProviderConfig & { id: number, name: string }) | null> {
    try {
      const result = await this.db.query(`
        SELECT id, name, type, endpoint, model, config, enabled, priority
        FROM ai_providers
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type as 'ollama' | 'lmstudio' | 'openapi' | 'openai',
        endpoint: row.endpoint,
        model: row.model,
        enabled: row.enabled,
        priority: row.priority,
        healthCheck: row.config?.healthCheck ?? true,
        timeout: row.config?.timeout,
        maxRetries: row.config?.maxRetries
      };
    } catch (error) {
      console.error(`Failed to get AI provider with ID ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Create a new AI provider
   */
  async createProvider(provider: Omit<AIProviderConfig & { name: string }, 'id'>): Promise<number> {
    try {
      const { name, type, endpoint, model, enabled, priority } = provider;
      
      // Extract additional config properties
      const config = {
        healthCheck: provider.healthCheck,
        timeout: provider.timeout,
        maxRetries: provider.maxRetries
      };

      const result = await this.db.query(`
        INSERT INTO ai_providers (name, type, endpoint, model, config, enabled, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [name, type, endpoint, model, JSON.stringify(config), enabled, priority]);

      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to create AI provider:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Update an existing AI provider
   */
  async updateProvider(id: number, provider: Partial<AIProviderConfig & { name: string }>): Promise<boolean> {
    try {
      // Build the update query dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (provider.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(provider.name);
      }

      if (provider.type !== undefined) {
        updates.push(`type = $${paramIndex++}`);
        values.push(provider.type);
      }

      if (provider.endpoint !== undefined) {
        updates.push(`endpoint = $${paramIndex++}`);
        values.push(provider.endpoint);
      }

      if (provider.model !== undefined) {
        updates.push(`model = $${paramIndex++}`);
        values.push(provider.model);
      }

      if (provider.enabled !== undefined) {
        updates.push(`enabled = $${paramIndex++}`);
        values.push(provider.enabled);
      }

      if (provider.priority !== undefined) {
        updates.push(`priority = $${paramIndex++}`);
        values.push(provider.priority);
      }

      // Handle config updates
      const configUpdates: Record<string, any> = {};
      if (provider.healthCheck !== undefined) configUpdates.healthCheck = provider.healthCheck;
      if (provider.timeout !== undefined) configUpdates.timeout = provider.timeout;
      if (provider.maxRetries !== undefined) configUpdates.maxRetries = provider.maxRetries;

      if (Object.keys(configUpdates).length > 0) {
        updates.push(`config = config || $${paramIndex++}::jsonb`);
        values.push(JSON.stringify(configUpdates));
      }

      if (updates.length === 0) {
        return false; // Nothing to update
      }

      // Add the ID as the last parameter
      values.push(id);

      const result = await this.db.query(`
        UPDATE ai_providers
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `, values);

      return result.rowCount > 0;
    } catch (error) {
      console.error(`Failed to update AI provider with ID ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Delete an AI provider
   */
  async deleteProvider(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(`
        DELETE FROM ai_providers
        WHERE id = $1
      `, [id]);

      return result.rowCount > 0;
    } catch (error) {
      console.error(`Failed to delete AI provider with ID ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

/**
 * Interface for chat message data
 */
export interface ChatMessageData {
  id?: number;
  session_id: string;
  context_type: 'ic' | 'ooc' | 'admin';
  sender_type: 'player' | 'ai';
  content: string;
  provider_used?: string;
  created_at?: Date;
}

/**
 * Database interface for chat messages
 */
export class ChatDataAccess {
  private db: N8nDatabase;

  constructor(db: N8nDatabase) {
    this.db = db;
  }

  /**
   * Save a chat message to the database
   */
  async saveChatMessage(message: Omit<ChatMessageData, 'id' | 'created_at'>): Promise<number> {
    try {
      const { session_id, context_type, sender_type, content, provider_used } = message;

      const result = await this.db.query(`
        INSERT INTO chat_messages (session_id, context_type, sender_type, content, provider_used)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [session_id, context_type, sender_type, content, provider_used || null]);

      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to save chat message:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get chat messages for a session
   */
  async getChatMessages(
    sessionId: string,
    limit: number = 50,
    offset: number = 0,
    contextType?: 'ic' | 'ooc' | 'admin'
  ): Promise<ChatMessageData[]> {
    try {
      let query = `
        SELECT id, session_id, context_type, sender_type, content, provider_used, created_at
        FROM chat_messages
        WHERE session_id = $1
      `;
      
      const params: any[] = [sessionId];
      let paramIndex = 2;

      if (contextType) {
        query += ` AND context_type = $${paramIndex++}`;
        params.push(contextType);
      }

      query += `
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;
      
      params.push(limit, offset);

      const result = await this.db.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        session_id: row.session_id,
        context_type: row.context_type,
        sender_type: row.sender_type,
        content: row.content,
        provider_used: row.provider_used,
        created_at: row.created_at
      }));
    } catch (error) {
      console.error(`Failed to get chat messages for session ${sessionId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Delete chat messages for a session
   */
  async deleteChatMessages(sessionId: string, contextType?: 'ic' | 'ooc' | 'admin'): Promise<number> {
    try {
      let query = `
        DELETE FROM chat_messages
        WHERE session_id = $1
      `;
      
      const params: any[] = [sessionId];

      if (contextType) {
        query += ` AND context_type = $2`;
        params.push(contextType);
      }

      const result = await this.db.query(query, params);

      return result.rowCount;
    } catch (error) {
      console.error(`Failed to delete chat messages for session ${sessionId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

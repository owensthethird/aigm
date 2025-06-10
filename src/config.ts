// src/config.ts
import 'dotenv/config';
import { AgentConfig } from './agent';
import * as fs from 'fs';
import * as path from 'path';

// Try to load configuration from n8n-config.json if available
let n8nConfigFile: any = {};
try {
  const configPath = path.join(process.cwd(), 'n8n-config.json');
  if (fs.existsSync(configPath)) {
    n8nConfigFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Loaded configuration from n8n-config.json');
  }
} catch (error) {
  console.warn('Could not load n8n-config.json:', error instanceof Error ? error.message : String(error));
}

export const config: AgentConfig = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || (n8nConfigFile.n8n && n8nConfigFile.n8n.apiKey),
    // If you don't have API key, use basic auth instead:
    // username: process.env.N8N_USERNAME,
    // password: process.env.N8N_PASSWORD,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'n8n',
    user: process.env.DB_USER || 'n8n',
    password: process.env.DB_PASSWORD || '',
  },
};
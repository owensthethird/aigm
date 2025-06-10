# Config Module (`src/config.ts`)

This document provides detailed documentation for the `config` module, which centralizes the application's configuration settings. It loads environment variables using `dotenv` and can also incorporate settings from an `n8n-config.json` file if present. This module exports a single `config` object conforming to the `AgentConfig` interface.

## Overview

The `config.ts` file is responsible for consolidating all necessary configuration parameters for the n8n agent, including connection details for the n8n API and the PostgreSQL database. It prioritizes environment variables but falls back to values defined in `n8n-config.json` or sensible defaults.

## Configuration Loading Logic

```typescript
import 'dotenv/config';
import { AgentConfig } from './agent';
import * as fs from 'fs';
import * as path from 'path';

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

export const config: AgentConfig = { /* ... */ };
```

1.  **Environment Variables**: The module first loads environment variables using `dotenv/config`. This means that any variables defined in a `.env` file (or directly in the environment) will be accessible via `process.env`.
2.  **`n8n-config.json`**: It then attempts to read and parse an `n8n-config.json` file located in the project's root directory (`process.cwd()`).
    *   If the file exists and is valid JSON, its contents are loaded and used as a fallback or override for certain n8n-related settings.
    *   If the file does not exist or cannot be parsed, a warning is logged, but the application continues to load configuration from environment variables or hardcoded defaults.

## `config` Object

```typescript
export const config: AgentConfig = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || (n8nConfigFile.n8n && n8nConfigFile.n8n.apiKey),
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'n8n',
    user: process.env.DB_USER || 'n8n',
    password: process.env.DB_PASSWORD || '',
  },
};
```

The `config` object is exported and provides the consolidated configuration for the `N8nAgent`. It has two main properties:

### `n8n` Configuration

This object configures the `N8nClient` and includes:

*   **`baseUrl`**: The base URL for the n8n instance.
    *   **Source**: `process.env.N8N_BASE_URL` (environment variable) or defaults to `http://localhost:5678`.
*   **`apiKey`**: The API key for n8n authentication.
    *   **Source**: `process.env.N8N_API_KEY` (environment variable) or `n8nConfigFile.n8n.apiKey` (from `n8n-config.json`).

### `database` Configuration

This object configures the `N8nDatabase` and includes:

*   **`host`**: The database host.
    *   **Source**: `process.env.DB_HOST` (environment variable) or defaults to `localhost`.
*   **`port`**: The database port.
    *   **Source**: `process.env.DB_PORT` (environment variable, parsed as integer) or defaults to `5432`.
*   **`database`**: The database name.
    *   **Source**: `process.env.DB_NAME` (environment variable) or defaults to `n8n`.
*   **`user`**: The database user.
    *   **Source**: `process.env.DB_USER` (environment variable) or defaults to `n8n`.
*   **`password`**: The database user's password.
    *   **Source**: `process.env.DB_PASSWORD` (environment variable) or defaults to an empty string.

## Usage

The `config` object is imported by `src/cli.ts` and `src/agent.ts` to provide the necessary settings for initializing the `N8nAgent` and its components. 
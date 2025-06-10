# Agent Module (`src/agent.ts`)

This document provides a detailed overview of the `agent` module, which contains the core logic for the n8n agent. The main class in this module is `N8nAgent`, responsible for orchestrating interactions with the n8n API and the PostgreSQL database.

## `AgentConfig` Interface

```typescript
export interface AgentConfig {
  n8n: N8nConfig;
  database: DatabaseConfig;
}
```

This interface defines the configuration structure required to initialize an `N8nAgent` instance. It includes:

*   `n8n`: An object conforming to the `N8nConfig` interface, containing settings for the n8n client (e.g., API URL, API key).
*   `database`: An object conforming to the `DatabaseConfig` interface, containing settings for the database connection (e.g., connection string).

## `N8nAgent` Class

```typescript
export class N8nAgent {
  public client: N8nClient;
  public database: N8nDatabase;

  constructor(config: AgentConfig) {
    // ...
  }

  async initialize(): Promise<void> {
    // ...
  }

  async shutdown(): Promise<void> {
    // ...
  }

  async getSystemStatus(): Promise<any> {
    // ...
  }
}
```

The `N8nAgent` class is the central component of the agent, managing connections and operations with both n8n and the database.

### Constructor

```typescript
constructor(config: AgentConfig)
```

Initializes a new instance of the `N8nAgent` class.

*   **`config: AgentConfig`**: An object providing the necessary configuration for the n8n client and the database.

    Upon instantiation, it creates instances of `N8nClient` and `N8nDatabase` using the provided configuration.

### `initialize()` Method

```typescript
async initialize(): Promise<void>
```

This asynchronous method performs initial setup and connection tests for the agent.

1.  **n8n API Connection Test**: Attempts to connect to the n8n API by calling `this.client.getHealth()`. If the connection fails, it logs an error and re-throws it, halting initialization.
2.  **Database Connection Test (Optional)**: Attempts to connect to the PostgreSQL database by calling `this.database.connect()`. If the connection fails, it logs a warning but *does not* throw an error, allowing the agent to proceed without a database connection (useful for testing or specific deployment scenarios).

### `shutdown()` Method

```typescript
async shutdown(): Promise<void>
```

This asynchronous method handles the graceful shutdown of the agent.

1.  **Database Disconnection**: Disconnects from the PostgreSQL database by calling `this.database.disconnect()`.
2.  **Logging**: Logs a message indicating that the agent shutdown is complete.

### `getSystemStatus()` Method

```typescript
async getSystemStatus(): Promise<any>
```

This asynchronous method retrieves and returns the current system status, including information about n8n and database connectivity.

**Returns**:

*   `Promise<any>`: A promise that resolves to an object containing the system status. The object structure includes:
    *   `n8n`:
        *   `status`: Health status of the n8n API.
        *   `workflows`: Total number of workflows.
        *   `activeWorkflows`: Number of active workflows.
    *   `executions`:
        *   `recent`: Number of recent executions (up to 10).
        *   `lastExecution`: Timestamp of the last execution or 'none'.
    *   `database` (optional, included if database is connected):
        *   `connected`: `true` if connected, `false` otherwise.
        *   `timestamp`: Current database timestamp if connected.
        *   `error`: Error message if database is not available.

**Error Handling**:

*   If any part of the system status check fails (e.g., n8n API is unreachable), it throws an error with a descriptive message. 
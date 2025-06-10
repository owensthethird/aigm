# Database Module (`src/database.ts`)

This document provides detailed documentation for the `database` module, which is responsible for all interactions with the PostgreSQL database. It utilizes the `pg` library for database connectivity and operations. This module defines interfaces for database configuration, workflow executions, and execution analytics, and provides the `N8nDatabase` class for managing database connections and queries.

## Interfaces

### `DatabaseConfig` Interface

```typescript
export interface DatabaseConfig extends PoolConfig {
  // Extends pg PoolConfig
}
```

This interface extends `pg`'s `PoolConfig` interface, allowing for standard PostgreSQL connection configurations such as `user`, `host`, `database`, `password`, `port`, etc.

### `WorkflowExecution` Interface

```typescript
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: string;
  startedAt: Date;
  stoppedAt?: Date;
  workflowData?: any;
  data?: any;
}
```

This interface represents a detailed n8n workflow execution record as stored and retrieved from the database.

*   `id`: The unique identifier of the execution.
*   `workflowId`: The ID of the associated workflow.
*   `mode`: The execution mode (e.g., `manual`, `webhook`).
*   `retryOf?`: (Optional) The ID of the execution that this one is a retry of.
*   `status`: The status of the execution (e.g., `success`, `error`, `running`).
*   `startedAt`: The timestamp when the execution started.
*   `stoppedAt?`: (Optional) The timestamp when the execution stopped.
*   `workflowData?`: (Optional) Additional data related to the workflow (e.g., workflow name).
*   `data?`: (Optional) The execution data (e.g., input/output from n8n nodes).

### `ExecutionAnalytics` Interface

```typescript
export interface ExecutionAnalytics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  errorCount: number;
  dailyStats: Array<{
    date: string;
    executions: number;
    errors: number;
  }>;
}
```

This interface defines the structure for execution analytics data.

*   `totalExecutions`: The total number of executions within the queried period.
*   `successRate`: The percentage of successful executions.
*   `averageDuration`: The average duration of executions in seconds.
*   `errorCount`: The total number of failed executions.
*   `dailyStats`: An array of objects, each containing daily statistics:
    *   `date`: The date for which the statistics are provided.
    *   `executions`: The number of executions on that date.
    *   `errors`: The number of errors on that date.

## `N8nDatabase` Class

```typescript
export class N8nDatabase {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    // ...
  }

  async connect(): Promise<void> { /* ... */ }
  async disconnect(): Promise<void> { /* ... */ }
  async query(text: string, params?: any[]): Promise<any> { /* ... */ }
  async getExecutionDetails(workflowId?: string, limit: number = 100): Promise<WorkflowExecution[]> { /* ... */ }
  async getExecutionAnalytics(workflowId?: string, days: number = 30): Promise<ExecutionAnalytics> { /* ... */ }
  async getGameSessions(limit: number = 50): Promise<any[]> { /* ... */ }
  async getPlayerStats(sessionId?: string): Promise<any> { /* ... */ }
}
```

The `N8nDatabase` class provides methods for connecting to and querying a PostgreSQL database, primarily for n8n execution data and custom game session data.

### Constructor

```typescript
constructor(config: DatabaseConfig)
```

Initializes a new `N8nDatabase` instance.

*   **`config: DatabaseConfig`**: The configuration object for the PostgreSQL connection pool. This object extends `pg.PoolConfig` and should include database connection details.

    The constructor creates a new PostgreSQL `Pool` instance using the provided configuration.

### `connect()` Method

```typescript
async connect(): Promise<void>
```

Establishes a connection to the database by executing a simple `SELECT NOW()` query. This method is used to verify database connectivity during agent initialization.

*   **Throws**: If the connection fails, it logs the error and re-throws it.

### `disconnect()` Method

```typescript
async disconnect(): Promise<void>
```

Closes all connections in the PostgreSQL connection pool, gracefully shutting down database access.

### `query(text: string, params?: any[])` Method

```typescript
async query(text: string, params?: any[]): Promise<any>
```

Executes a SQL query against the database.

*   **`text: string`**: The SQL query string to execute.
*   **`params?: any[]`**: (Optional) An array of parameters to be used with the SQL query, preventing SQL injection.
*   **Returns**: `Promise<any>`: A promise that resolves to the result of the SQL query.

### `getExecutionDetails(workflowId?: string, limit: number = 100)` Method

```typescript
async getExecutionDetails(workflowId?: string, limit: number = 100): Promise<WorkflowExecution[]>
```

Retrieves detailed n8n workflow execution records from the database. It joins `execution_entity`, `workflow_entity`, and `execution_data` tables to provide comprehensive information.

*   **`workflowId?`**: (Optional) Filters executions by a specific workflow ID.
*   **`limit`**: The maximum number of execution records to retrieve (defaults to 100).
*   **Returns**: `Promise<WorkflowExecution[]>`: A promise that resolves to an array of `WorkflowExecution` objects.

### `getExecutionAnalytics(workflowId?: string, days: number = 30)` Method

```typescript
async getExecutionAnalytics(workflowId?: string, days: number = 30): Promise<ExecutionAnalytics>
```

Calculates and retrieves analytics for n8n workflow executions, including total executions, success rate, average duration, error count, and daily statistics. Data is fetched for a specified number of recent days.

*   **`workflowId?`**: (Optional) Filters analytics for a specific workflow ID.
*   **`days`**: The number of past days for which to retrieve analytics (defaults to 30).
*   **Returns**: `Promise<ExecutionAnalytics>`: A promise that resolves to an `ExecutionAnalytics` object.

### `getGameSessions(limit: number = 50)` Method

```typescript
async getGameSessions(limit: number = 50): Promise<any[]>
```

Retrieves custom game session data from the `execution_entity` and `execution_data` tables, specifically looking for records with a `session_id` in the `data` JSONB column.

*   **`limit`**: The maximum number of game session records to retrieve (defaults to 50).
*   **Returns**: `Promise<any[]>`: A promise that resolves to an array of objects, each representing a game session.

### `getPlayerStats(sessionId?: string)` Method

```typescript
async getPlayerStats(sessionId?: string): Promise<any>
```

Retrieves player statistics from game session data. It aggregates information such as total actions, max turn, character details, and first/last action timestamps. Can be filtered by a specific `sessionId`.

*   **`sessionId?`**: (Optional) Filters player statistics for a specific game session ID.
*   **Returns**: `Promise<any>`: A promise that resolves to an object containing player statistics (if `sessionId` is provided) or an array of such objects. 
# n8n Client Module (`src/n8n-client.ts`)

This document provides detailed documentation for the `n8n-client` module, which is responsible for all interactions with the n8n API. It defines interfaces for n8n configurations, workflows, and executions, and provides a client class (`N8nClient`) with methods for managing n8n resources.

## Interfaces

### `N8nConfig` Interface

```typescript
export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
}
```

This interface defines the configuration parameters required to connect to an n8n instance.

*   `baseUrl`: The base URL of your n8n instance (e.g., `http://localhost:5678`).
*   `apiKey?`: (Optional) The API key for authentication. This is the preferred method for authentication.
*   `username?`: (Optional) Username for basic authentication. Not recommended if `apiKey` is available.
*   `password?`: (Optional) Password for basic authentication. Not recommended if `apiKey` is available.

### `N8nWorkflow` Interface

```typescript
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}
```

This interface represents the structure of an n8n workflow object.

*   `id`: The unique identifier of the workflow.
*   `name`: The name of the workflow.
*   `active`: A boolean indicating if the workflow is currently active.
*   `nodes`: An array of nodes within the workflow.
*   `connections`: An object detailing the connections between nodes.
*   `settings?`: (Optional) Additional settings for the workflow.
*   `createdAt`: Timestamp when the workflow was created.
*   `updatedAt`: Timestamp when the workflow was last updated.

### `N8nExecution` Interface

```typescript
export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: 'success' | 'error' | 'canceled' | 'running' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  data?: any;
}
```

This interface represents the structure of an n8n workflow execution object.

*   `id`: The unique identifier of the execution.
*   `workflowId`: The ID of the workflow that was executed.
*   `mode`: The mode of execution (e.g., `manual`, `webhook`).
*   `retryOf?`: (Optional) The ID of the execution this one is retrying.
*   `status`: The current status of the execution (`success`, `error`, `canceled`, `running`, `waiting`).
*   `startedAt`: Timestamp when the execution started.
*   `stoppedAt?`: (Optional) Timestamp when the execution stopped.
*   `data?`: (Optional) Any associated data with the execution.

## `N8nClient` Class

```typescript
export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nConfig) {
    // ...
  }

  // Workflow Management
  async getWorkflows(): Promise<N8nWorkflow[]> { /* ... */ }
  async getWorkflow(id: string): Promise<N8nWorkflow> { /* ... */ }
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> { /* ... */ }
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> { /* ... */ }
  async deleteWorkflow(id: string): Promise<void> { /* ... */ }
  async activateWorkflow(id: string): Promise<void> { /* ... */ }
  async deactivateWorkflow(id: string): Promise<void> { /* ... */ }

  // Execution Management
  async getExecutions(workflowId?: string, limit: number = 100): Promise<N8nExecution[]> { /* ... */ }
  async getExecution(id: string, includeData: boolean = false): Promise<N8nExecution> { /* ... */ }
  async deleteExecution(id: string): Promise<void> { /* ... */ }
  async retryExecution(id: string): Promise<N8nExecution> { /* ... */ }

  // Webhook Management
  async executeWebhook(webhookPath: string, data: any, method: string = 'POST'): Promise<any> { /* ... */ }

  // Health Check
  async getHealth(): Promise<{ status: string }> { /* ... */ }
}
```

 The `N8nClient` class provides methods for interacting with the n8n REST API.

### Constructor

```typescript
constructor(config: N8nConfig)
```

Initializes a new `N8nClient` instance.

*   **`config: N8nConfig`**: The configuration object containing `baseUrl` and authentication details.

    The constructor sets up an `axios` instance with the base URL and configures request and response interceptors for logging. It prioritizes API key authentication and logs a warning if no API key is provided.

### Workflow Management Methods

#### `getWorkflows()`

```typescript
async getWorkflows(): Promise<N8nWorkflow[]>
```

Retrieves a list of all workflows from the n8n instance.

*   **Returns**: `Promise<N8nWorkflow[]>`: A promise that resolves to an array of `N8nWorkflow` objects.

#### `getWorkflow(id: string)`

```typescript
async getWorkflow(id: string): Promise<N8nWorkflow>
```

Retrieves a specific workflow by its ID.

*   **`id: string`**: The ID of the workflow to retrieve.
*   **Returns**: `Promise<N8nWorkflow>`: A promise that resolves to an `N8nWorkflow` object.

#### `createWorkflow(workflow: Partial<N8nWorkflow>)`

```typescript
async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow>
```

Creates a new workflow in n8n.

*   **`workflow: Partial<N8nWorkflow>`**: An object containing the partial details of the workflow to create.
*   **Returns**: `Promise<N8nWorkflow>`: A promise that resolves to the newly created `N8nWorkflow` object.

#### `updateWorkflow(id: string, workflow: Partial<N8nWorkflow>)`

```typescript
async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow>
```

Updates an existing workflow by its ID.

*   **`id: string`**: The ID of the workflow to update.
*   **`workflow: Partial<N8nWorkflow>`**: An object containing the partial details to update the workflow with.
*   **Returns**: `Promise<N8nWorkflow>`: A promise that resolves to the updated `N8nWorkflow` object.

#### `deleteWorkflow(id: string)`

```typescript
async deleteWorkflow(id: string): Promise<void>
```

Deletes a workflow by its ID.

*   **`id: string`**: The ID of the workflow to delete.
*   **Returns**: `Promise<void>`: A promise that resolves when the workflow is successfully deleted.

#### `activateWorkflow(id: string)`

```typescript
async activateWorkflow(id: string): Promise<void>
```

Activates a workflow by its ID.

*   **`id: string`**: The ID of the workflow to activate.
*   **Returns**: `Promise<void>`: A promise that resolves when the workflow is successfully activated.

#### `deactivateWorkflow(id: string)`

```typescript
async deactivateWorkflow(id: string): Promise<void>
```

Deactivates a workflow by its ID.

*   **`id: string`**: The ID of the workflow to deactivate.
*   **Returns**: `Promise<void>`: A promise that resolves when the workflow is successfully deactivated.

### Execution Management Methods

#### `getExecutions(workflowId?: string, limit: number = 100)`

```typescript
async getExecutions(workflowId?: string, limit: number = 100): Promise<N8nExecution[]>
```

Retrieves a list of workflow executions. Can be filtered by `workflowId` and limited by `limit`.

*   **`workflowId?`**: (Optional) The ID of a specific workflow to retrieve executions for.
*   **`limit`**: The maximum number of executions to retrieve (defaults to 100).
*   **Returns**: `Promise<N8nExecution[]>`: A promise that resolves to an array of `N8nExecution` objects.

#### `getExecution(id: string, includeData: boolean = false)`

```typescript
async getExecution(id: string, includeData: boolean = false): Promise<N8nExecution>
```

Retrieves a specific workflow execution by its ID.

*   **`id: string`**: The ID of the execution to retrieve.
*   **`includeData`**: A boolean indicating whether to include execution data in the response (defaults to `false`).
*   **Returns**: `Promise<N8nExecution>`: A promise that resolves to an `N8nExecution` object.

#### `deleteExecution(id: string)`

```typescript
async deleteExecution(id: string): Promise<void>
```

Deletes a workflow execution by its ID.

*   **`id: string`**: The ID of the execution to delete.
*   **Returns**: `Promise<void>`: A promise that resolves when the execution is successfully deleted.

#### `retryExecution(id: string)`

```typescript
async retryExecution(id: string): Promise<N8nExecution>
```

Retries a failed workflow execution by its ID.

*   **`id: string`**: The ID of the execution to retry.
*   **Returns**: `Promise<N8nExecution>`: A promise that resolves to the new `N8nExecution` object created by the retry.

### Webhook Management Methods

#### `executeWebhook(webhookPath: string, data: any, method: string = 'POST')`

```typescript
async executeWebhook(webhookPath: string, data: any, method: string = 'POST'): Promise<any>
```

Executes a specific n8n webhook.

*   **`webhookPath: string`**: The path of the webhook (e.g., `my-webhook-path`).
*   **`data: any`**: The data payload to send to the webhook.
*   **`method: string`**: The HTTP method for the webhook request (defaults to `POST`).
*   **Returns**: `Promise<any>`: A promise that resolves to the response data from the webhook execution.

### Health Check Methods

#### `getHealth()`

```typescript
async getHealth(): Promise<{ status: string }>
```

Performs a health check on the n8n instance.

*   **Returns**: `Promise<{ status: string }>`: A promise that resolves to an object containing the health status (e.g., `{ status: 'UP' }`).
*   **Error Handling**: Catches and logs any errors during the health check, then re-throws the error. 
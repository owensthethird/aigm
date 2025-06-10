# CLI Module (`src/cli.ts`)

This document provides detailed documentation for the `cli` module, which serves as the command-line interface (CLI) entry point for the n8n agent. It parses command-line arguments and orchestrates various operations by interacting with the `N8nAgent` instance.

## Overview

The `cli.ts` file contains the `main` asynchronous function, which is executed when the CLI is run. It initializes the `N8nAgent` and then performs actions based on the command-line arguments provided.

## `main()` Function

```typescript
async function main(): Promise<void> {
  const command = process.argv[2];
  const param = process.argv[3];
  
  const agent = new N8nAgent(config);
  
  try {
    // ... initialization ...
    switch (command) {
      case 'status': { /* ... */ }
      case 'workflows': { /* ... */ }
      case 'executions': { /* ... */ }
      case 'create-workflow': { /* ... */ }
      default: { /* ... */ }
    }
  } catch (error) { /* ... */ } finally { /* ... */ }
}

main();
```

The `main` function is the core of the CLI. It performs the following steps:

1.  **Argument Parsing**: Retrieves the command and an optional parameter from `process.argv`.
2.  **Agent Initialization**: Creates a new instance of `N8nAgent` using the `config` object imported from `./config.ts`.
3.  **Agent Connection**: Calls `agent.initialize()` to establish connections to the n8n API and (optionally) the database.
4.  **Command Execution**: Uses a `switch` statement to execute different functionalities based on the provided command.
5.  **Error Handling**: Catches and logs any errors that occur during execution.
6.  **Agent Shutdown**: Ensures `agent.shutdown()` is called in a `finally` block to disconnect from the database.

### Available Commands

#### `status`

Checks and displays the current system status, including n8n health, workflow counts, and recent execution details.

**Usage**:

```bash
npm run dev status
```

**Output Example**:

```json
System Status: {
  "n8n": {
    "status": "UP",
    "workflows": 5,
    "activeWorkflows": 3
  },
  "executions": {
    "recent": 5,
    "lastExecution": "2023-10-27T10:00:00.000Z"
  },
  "database": {
    "connected": true,
    "timestamp": "2023-10-27T10:05:00.000Z"
  }
}
```

#### `workflows`

Fetches and lists all workflows present in the configured n8n instance, showing their name and active status.

**Usage**:

```bash
npm run dev workflows
```

**Output Example**:

```
Found 2 workflows:
  - My First Workflow (active)
  - Data Processing (inactive)
```

#### `executions`

Fetches and displays the 5 most recent workflow executions, showing their ID, status, and start time.

**Usage**:

```bash
npm run dev executions
```

**Output Example**:

```
Recent executions (2):
  - 12345: success at 2023-10-27T09:55:00.000Z
  - 67890: error at 2023-10-27T09:50:00.000Z
```

#### `create-workflow`

Creates a predefined test workflow in the n8n instance. An optional workflow name can be provided.

**Usage**:

```bash
npm run dev create-workflow [workflow-name]
```

*   **`workflow-name`**: (Optional) A custom name for the new workflow. If not provided, a default name like `Test Workflow YYYY-MM-DD` will be used.

**Test Workflow Structure**:

The workflow created by this command includes a 'Start' node and a 'Set' node, and explicitly uses an empty settings object as required by the n8n API. The `active` property is handled as read-only by the n8n API.

```json
{
  "name": "Test Workflow [YYYY-MM-DD]",
  "nodes": [
    {
      "id": "Start",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [100, 300],
      "parameters": {}
    },
    {
      "id": "Set",
      "name": "Set",
      "type": "n8n-nodes-base.set",
      "position": [300, 300],
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message",
              "value": "Hello from n8n Agent!"
            },
            {
              "name": "timestamp",
              "value": "={{ $now() }}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [ { "node": "Set", "type": "main", "index": 0 } ]
      ]
    }
  },
  "settings": {}
}
```

**Example**:

```bash
npm run dev create-workflow MyCustomTestFlow
```

**Output Example**:

```
🔨 Creating a test workflow...
✅ Workflow created successfully:
  - ID: a1b2c3d4-e5f6-7890-1234-567890abcdef
  - Name: MyCustomTestFlow
  - Status: inactive
```

#### Default/Help Message

If no command or an unrecognized command is provided, the CLI will display a help message listing all available commands and their basic usage.

**Usage**:

```bash
npm run dev
# or
npm run dev unknown-command
```

**Output Example**:

```
Available commands:
  status          - Check system status
  workflows       - List all workflows
  executions      - Show recent executions
  create-workflow - Create a test workflow [optional: workflow name]

Usage: npm run dev <command> [params]
``` 